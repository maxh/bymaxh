import ast
import xml.etree.ElementTree as ET
import jinja2
import logging
import os
import urllib
import urllib2
import webapp2

import models

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(
        os.path.dirname(__file__) + '/templates/'),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

DRIVE_URL = 'https://googledrive.com/'
ROOT_DRIVE_PATH = 'host/0B3xQvLGrxw5PeF91Smx0Z2J4dHM/'
YQL_URL = 'http://query.yahooapis.com/v1/public/yql?q='


class MainPage(webapp2.RequestHandler):

    def get(self):
        content = models.Content.query().fetch(1)
        if len(content) == 0:
            logging.info("nothing in the cache... going to the net")
            content = retrieveContentFromDrive()
        else:
            logging.info(content[0].content)
            content = ast.literal_eval(content[0].content)
        logging.info('Content to send to template:')
        logging.info(content)
        template = JINJA_ENVIRONMENT.get_template('index.html')
        self.response.write(template.render(content))


class GetContent(webapp2.RequestHandler):

    def get(self):
        retrieveContentFromDrive()

routes = [
    ('/', MainPage),
    ('/cron/refresh', GetContent)
]
app = webapp2.WSGIApplication(routes)



""" Helper functions for retrieving the content hierarchy from Google Drive. """

def getYqlUrl(drive_path):
    DRIVE_QUERY = 'select * from html where url="' + DRIVE_URL + drive_path + '" and xpath=\'//div[@class="folder-cell"]/a\''
    return YQL_URL + urllib.quote_plus(DRIVE_QUERY)

def getDriveFolderContents(drive_path):
    url = getYqlUrl(drive_path)
    logging.info(url)
    response = urllib2.urlopen(url).read()
    logging.info(response)
    root = ET.fromstring(response)
    results = root[0]
    items = []
    for result in results:
        item = {
            'name': result.text,
            'path': result.attrib['href'],
        }
        if item['name'] != 'Back to parent' and item['name'] != 'full_res':
            items.append(item)
    logging.info(items)
    return items

def retrieveContentFromDrive():
    categories = getDriveFolderContents(ROOT_DRIVE_PATH)
    for category in categories:
        category['contents'] = getDriveFolderContents(category['path'])
    existing = models.Content.query().fetch(1)
    if len(existing) == 1:
        existing.key.delete()
    categoriesObject = {'categories': categories}
    content = models.Content(content=str(categoriesObject))
    content.put()
    return categoriesObject
