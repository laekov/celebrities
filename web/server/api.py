from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt;
import os;
from os import path;
from bs4 import BeautifulSoup;
import re;
import json;

def test(req):
    return HttpResponse('<h1>Test fine</h1>');

nmdx = { };
ctdx = { };

def addScore(dt, cid, sco):
    if (not (cid in dt)):
        dt[cid] = 0;
    dt[cid] += sco;


@csrf_exempt
def search(req):
    rankwei = 1000000;
    global nmdx;
    global ctdx;
    res = {};
    qbody = json.loads(req.body);
    qstr = qbody['content'].lower();
    qss = qstr.split(' ');
    for i in nmdx:
        v = nmdx[i];
        if (i.find(qstr) > -1 or qstr.find(i) > -1):
            for j in v:
                addScore(res, j, rankwei);
        for k in qss:
            if (i.find(k) > -1):
                for j in v:
                    addScore(res, j, rankwei / 2 / (i.count(' ') + 1));
    for i in qss:
        if (i in ctdx):
            for j in ctdx[i]:
                addScore(res, j, rankwei / 8 / len(ctdx[i]));
    return HttpResponse(json.dumps(res));

def dfsChildren(ele, itid):
    global ctdx;
    if ('contents' in ele):
        ch = ele.contents;
        for i in ch:
            dfsChildren(i, itid);
    else:
        if (ele.string == None):
            return;
        for kw in re.findall(r"[A-Za-z\']+", ele.string):
            ikw = kw.encode('utf-8').strip().lower();
            if (not (ikw in ctdx)):
                ctdx[ikw] = [];
            ctdx[ikw].append(itid);

def calculate():
    global nmdx;
    global ctdx;
    datapath = path.join(path.dirname(path.realpath(__file__)), '../../crawl/data/');
    filelist = os.listdir(datapath);
    for item in filelist:
        itid = item.split('.')[0];
        inft = open(path.join(datapath, item));
        soup = BeautifulSoup(inft.read());
        inft.close();
        namess = soup.select('.fn');
        for namear in namess:
            name = namear.contents[0];
            if ('contents' in name):
                continue;
            name = name.encode('utf-8').strip().lower();
            if (not (name in nmdx)):
                nmdx[name] = [];
            nmdx[name].append(itid);
        kisss = soup.select('td');
        for keyss in kisss:
            dfsChildren(keyss, itid);
        tml = len(nmdx);
        if (tml % 1000 == 0):
            print len(nmdx), len(ctdx);
    outf = open(path.join(datapath, 'nmdx.json'), 'w');
    print >> outf, json.dumps(nmdx);
    outf.close();
    outf = open(path.join(datapath, 'ctdx.json'), 'w');
    print >> outf, json.dumps(ctdx);
    outf.close();

def reload(req):
    datapath = path.join(path.dirname(path.realpath(__file__)), '../../crawl/data/');
    global nmdx;
    global ctdx;
    infl = open(path.join(datapath, 'nmdx.json'), 'r');
    nmdx = json.loads(infl.read());
    infl.close();
    infl = open(path.join(datapath, 'ctdx.json'), 'r');
    ctdx = json.loads(infl.read());
    infl.close();
    return HttpResponse('done');
