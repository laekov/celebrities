from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt;
import os;
from os import path;
from bs4 import BeautifulSoup;
import re;
import json;

def test(req):
    return HttpResponse('<h1>Test fine</h1>');

kwdx = { };
ctdx = { };

def addScore(dt, cid, sco):
    if (not (cid in dt)):
        dt[cid] = 0;
    dt[cid] += sco;


@csrf_exempt
def search(req):
    rankwei = 1000000;
    global kwdx;
    global ctdx;
    res = {};
    qbody = json.loads(req.body);
    qstr = qbody['content'].lower();
    qss = qstr.split(' ');
    for i in kwdx['name']:
        v = kwdx['name'][i];
        if (i.find(qstr) > -1 or qstr.find(i) > -1):
            for j in v:
                addScore(res, j, rankwei);
        for k in qss:
            if (i.find(k) > -1):
                for j in v:
                    addScore(res, j, rankwei / 2 / (i.count(' ') + 1));
    for i in qss:
        if (i.find(':') == -1):
            if (i in ctdx):
                for j in ctdx[i]:
                    addScore(res, j, rankwei / 8 / len(ctdx[i]));
        else:
            (field, text) = i.split(':');
            texts = text.lower().split('_');
            if (not (field in kwdx)):
                continue;
            for j in texts:
                if (j in kwdx[field]):
                    for k in kwdx[field][j]:
                        addScore(res, k, rankwei / len(kwdx[field][j]));

    return HttpResponse(json.dumps(res));

def getName(soup, itid, nmdx):
    namess = soup.select('.fn');
    for namear in namess:
        name = namear.contents[0];
        if (len(namear.contents) > 1):
            names = namear.select('li');
            for namer in names:
                name = namer.contents[0].encode('utf-8').strip().lower();
                if (len(name) < 3):
                    continue;
                if (not (name in nmdx)):
                    nmdx[name] = [];
                nmdx[name].append(itid);
            continue;
        name = name.encode('utf-8').strip().lower();
        if (len(name) < 3):
            continue;
        if (not (name in nmdx)):
            nmdx[name] = [];
        nmdx[name].append(itid);

def getContent(ele):
    cstr = ele.string;
    if (cstr == None):
        cstr = (' ').join(ele.strings);
    exp = re.compile(r'<[^\w*]>');
    return (' ').join(exp.split(cstr)).lower().split(' ');

def insertKeys(ele, itid, mp):
    for i in getContent(ele):
        if (len(i) < 3):
            continue;
        if (not (i in mp)):
            mp[i] = [];
        mp[i].append(itid);

def calculate():
    global ctdx;
    global kwdx;
    kws = [ 'name', 'born', 'education', 'occupation', 'nationality' ];
    for kw in kws:
        kwdx[kw] = { };
    datapath = path.join(path.dirname(path.realpath(__file__)), '../../crawl/data/');
    filelist = os.listdir(datapath);
    for item in filelist:
        itid = item.split('.')[0];
        inft = open(path.join(datapath, item));
        soup = BeautifulSoup(inft.read());
        inft.close();
        getName(soup, itid, kwdx['name']);
        kisss = soup.select('td');
        for keyss in kisss:
            insertKeys(keyss, itid, ctdx);
        trss = soup.select('tr');
        for trs in trss:
            for kw in kws:
                isKw = False;
                for i in trs.select('th'):
                    cstr = (' ').join(getContent(i)); 
                    if (re.compile(kw, re.I).match(cstr) != None):
                        isKw = True;
                        break;
                if (isKw):
                    for i in trs.select('td'):
                        insertKeys(i, itid, kwdx[kw]);
        tml = len(kwdx['name']);
        if (tml % 100 == 0):
            print len(kwdx['name']), len(ctdx);
    outf = open(path.join(datapath, 'kwdx.json'), 'w');
    print >> outf, json.dumps(kwdx);
    outf.close();
    outf = open(path.join(datapath, 'ctdx.json'), 'w');
    print >> outf, json.dumps(ctdx);
    outf.close();

def reload(req):
    datapath = path.join(path.dirname(path.realpath(__file__)), '../../crawl/data/');
    global kwdx;
    global ctdx;
    infl = open(path.join(datapath, 'kwdx.json'), 'r');
    kwdx = json.loads(infl.read());
    infl.close();
    infl = open(path.join(datapath, 'ctdx.json'), 'r');
    ctdx = json.loads(infl.read());
    infl.close();
    return HttpResponse('done');
