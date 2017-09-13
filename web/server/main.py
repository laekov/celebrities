from django.http import HttpResponse
import os;

infile = open(os.path.join(os.path.dirname(os.path.realpath(__file__)), '../static/index.html'), 'r');
html = infile.read();
infile.close();

def main(req):
    return HttpResponse(html);
