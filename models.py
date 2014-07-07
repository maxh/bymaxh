# App Engine imports.
from google.appengine.ext import ndb


class Content(ndb.Model):

    content = ndb.TextProperty()
