#!/usr/bin/python
# -*- coding: utf-8 -*-
from flask import Flask, render_template, request
from flask_uploads import UploadSet, configure_uploads, ALL 
from gevent.wsgi import WSGIServer
import os

browser_width = 1024

app = Flask(__name__)
app.config['PROPAGATE_EXCEPTIONS'] = True
app.config['UPLOADED_PHOTOS_DEST'] = app.static_folder

gg = UploadSet('test', ALL,
        default_dest=lambda app: app.static_folder)

configure_uploads(app, gg)

@app.route('/width', methods=['GET', 'POST'])
def width():
    if request.method == 'POST':
        my_json = request.json
        browser_width = my_json.get('width')
        print('Browser width: {}'.format(browser_width)) 
        return render_template('index.html')
@app.route('/', methods=['GET', 'POST'])
def upload():
    if request.method == 'GET':
        print('GET!')

    if request.method == 'POST' and 'upload' in request.files:
        filename = gg.save(request.files['upload'])
        full_path_file = '{}/{}'.format(app.static_folder, filename)
        dic = {}
        dic['data'] = []
        print('Step: {}'.format(browser_width))
        with open(full_path_file) as f:
            lines = f.readlines()
            count = 0
            last_v1 = 0.0
            last_v2 = 0.0
            last_v3 = 0.0
            #for l in lines:
            for idx in xrange(0, len(lines)):
                #print(l)
                tok = lines[idx].split('\n')[0]
                # 2017/05/31 12:30:15 15 32 15
                # only keep slope > 3.0
                toks = tok.split()
                current_v1 = float(toks[2])
                current_v2 = float(toks[3])
                current_v3 = float(toks[4])
                grid = 3.0
                if abs(current_v1 - last_v1) > grid or abs(current_v2 - last_v2) > grid or abs(current_v3 - last_v3) > grid:
                    dic['data'].append(tok)
                last_v1 = current_v1
                last_v2 = current_v2
                last_v3 = current_v3

                count += 1
                if count == browser_width:
                    count = 0 
                    dic['data'].append(tok)
        #print(dic)
        # remove the file
        os.remove(full_path_file)
        print('render points: {}'.format(len(dic['data'])))
        return render_template('display.html', backend_data=dic)
    return render_template('index.html')

def run_server():
    http_server = WSGIServer(('', 7777), app)
    http_server.serve_forever()

if __name__ == '__main__':
    run_server()
