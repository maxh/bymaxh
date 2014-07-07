import ast
import xml.etree.ElementTree as ET
import jinja2
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


class MainPage(webapp2.RequestHandler):

    def get(self):
        content = models.Content.query().fetch(1)
        if len(content) == 0:
            content = retrieveContentFromDrive()
        else:
            content = ast.literal_eval(content[0].content)
        template = JINJA_ENVIRONMENT.get_template('index.html')
        self.response.write(template.render(content))


class GetContent(webapp2.RequestHandler):

    def get(self):
        retrieveContentFromDrive()
        self.response.write('Content refreshed :)')

routes = [
    ('/', MainPage),
    ('/cron/refresh', GetContent)
]
app = webapp2.WSGIApplication(routes)



""" Helper functions for retrieving the content hierarchy from Google Drive. """

DRIVE_URL = 'https://googledrive.com/'
ROOT_DRIVE_PATH = 'host/0B3xQvLGrxw5PeF91Smx0Z2J4dHM/'
YQL_URL = 'http://query.yahooapis.com/v1/public/yql?q='

def getYqlUrl(drive_path):
    driveQuery = 'select * from html where url="' + DRIVE_URL + drive_path + '" and xpath=\'//div[@class="folder-cell"]/a\''
    return YQL_URL + urllib.quote_plus(drive_query)

def getDriveFolderContents(drive_path):
    url = getYqlUrl(drive_path)
    response = urllib2.urlopen(url).read()
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
    return items

def retrieveContentFromDrive():
    categories = getDriveFolderContents(ROOT_DRIVE_PATH)
    for category in categories:
        category['contents'] = getDriveFolderContents(category['path'])
    existing = models.Content.query().fetch(1)
    if len(existing) == 1:
        existing[0].key.delete()
    categoriesObject = {'categories': categories}
    content = models.Content(content=str(categoriesObject))
    content.put()
    return categoriesObject
