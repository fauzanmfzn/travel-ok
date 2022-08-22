import base64
from base64 import decode
from sqlalchemy.orm import sessionmaker
from flask import Flask, jsonify, make_response, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import datetime
import jwt

# catatan: nama password adalah nama username tambahkan 123 tapi hilangkan kata aja

app = Flask(__name__)
db = SQLAlchemy(app)
CORS(app, supports_credentials=True)

app.config['SECRET_KEY'] = 'secret'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:SEPULUHAPRIL1999@localhost:5432/travel_ok?sslmode=disable'

jad_rute = db.Table('jad_rute',
    db.Column('id_schedule', db.Integer, db.ForeignKey('schedule.id', ondelete='CASCADE'), primary_key=True),
    db.Column('id_rute', db.Integer, db.ForeignKey('rute.id', ondelete='CASCADE'), primary_key=True)
)

class user(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    nama = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    username = db.Column(db.String, nullable=False)
    password = db.Column(db.String, nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    order_sum = db.Column(db.Integer)
    saldo = db.Column(db.Integer)
    orders = db.relationship('order', backref='owner', lazy='dynamic')

    def __repr__(self):
        return f'user<{self.nama},{self.email}>'

class rute(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    kota_asal = db.Column(db.String, nullable=False)
    kota_tujuan = db.Column(db.String, nullable=False)
    durasi = db.Column(db.Time, nullable=False)
    tarif = db.Column(db.Integer, nullable=False)
    cars = db.relationship('car', backref='mobil', lazy='dynamic')
    sche_rut = db.relationship('schedule', secondary=jad_rute, backref='sche_rut', passive_deletes=True)
    order_rute = db.relationship('order', backref='jalan', lazy='dynamic')

    def __repr__(self):
        return f'rute<{self.kota_asal},{self.tarif}>'

class schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    hari = db.Column(db.String, nullable=False)
    jam = db.Column(db.Time, nullable=False)
    order_jad = db.relationship('order', backref='jadwal', lazy='dynamic')
    rut_sche = db.relationship('rute', secondary=jad_rute, backref=('rut_sche'), passive_deletes=True)
    temp_cap = db.Column(db.Integer)

    def __repr__(self):
        return f'schedule<{self.hari},{self.jam}>'

class car(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    kode = db.Column(db.String, nullable=False)
    spesifikasi = db.Column(db.String, nullable=False)
    kapasitas = db.Column(db.Integer, nullable=False)
    id_rute = db.Column(db.Integer, db.ForeignKey('rute.id'), nullable=False)
    car_or = db.relationship('order', backref='bus', lazy='dynamic')
    # car_cap = db.relationship('schedule', backref='car_cap', lazy=True)

    def __repr__(self):
        return f'car<{self.kapasitas}>'

class order(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rute_id = db.Column(db.Integer, db.ForeignKey('rute.id'), nullable=False)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedule.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total_harga = db.Column(db.Integer, nullable=False)
    car_id = db.Column(db.Integer, db.ForeignKey('car.id'), nullable=False)
    nama = db.Column(db.String)
    kotaasal = db.Column(db.String)
    hari = db.Column(db.String)
    mobil = db.Column(db.String)
    tanggal = db.Column(db.Date)
    jam = db.Column(db.Time)
    kotatujuan = db.Column(db.String)

    def __repr__(self):
        return f'order<{self.user_id}>'

db.create_all()
db.session.commit()

def is_authorized_user(aut):
    if aut == None:
        return False
    
    b = base64.b64decode(aut[6:])
    c = b.decode('ascii')
    lis = c.split(':')
    username = lis[0]
    password = lis[1]
    user1 = user.query.filter_by(username=username).filter_by(password=password).first()
    if not user1:
        return 'unauthorized'
    else:
        return [username, password]

def token_req(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return jsonify({'message':'token gak ada'})

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms="HS256")
            current_user = user.query.filter_by(username=data['username']).first()
        except Exception as r:
            return jsonify({'message':'token is invalid', 'error':str(r)})
    
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/')
@token_req
def home(current_user):
    return {
        'message':'selamat datang di aplikasi berbasis web Travel-ok'
    }

# crud user

@app.route('/user/', methods=['POST'])
def create_user():
    data = request.get_json()
    if not 'name' in data or not 'email' in data or not 'username' in data or not 'password' in data:
        return {
            'message':'input data yang benar'
        }, 400
    if len(data['email']) < 12 or len(data['password'])<5:
        return {
            'message':'masukkan email dan passoword dengan benar'
        }, 400
    
    hashed_pass = generate_password_hash(data['password'], method='sha256')
    x = user(
        nama = data['name'],
        email = data['email'],
        username = data['username'],
        password = hashed_pass,
        is_admin = data.get('is_admin', False)
    )
    db.session.add(x)
    db.session.commit()
    return {
        'name': x.nama, 'email': x.email,
        'username': x.username, 'password': x.password, 'is_admin': x.is_admin,
        'jumlah_order': x.order_sum, 'saldo': x.saldo
    }, 201

@app.route('/user/', methods=['PUT'])
@token_req
def update_user(current_user):
    data = request.get_json()
    current_user.nama = data['nama']
    current_user.email = data['email']
    current_user.username = data['username']
    db.session.commit()
    return {
        'message':'berhasil update data'
    }

@app.route('/topuser/')
@token_req
def topuser(current_user):
    if current_user.is_admin == True:
        x = db.engine.execute('select nama, email, username, order_sum from "user" order by "user".order_sum desc nulls last limit 5')
        k = []
        for i in x:
            k.append({
                'nama':i[0],
                'email': i[1],
                'username':i[2],
                'jumlah_order':i[3]
                })
        return jsonify(k)
    else:
        return {
            'message':'kamu bukan admin'
        }

@app.route('/user/')
@token_req
def get_user(current_user):
    return jsonify([{
        'nama':x.nama,
        'email':x.email,
        'username':x.username
    } for x in user.query.all()] 
    )

@app.route('/users')
@token_req
def get_one_user(current_user):
    return jsonify({
        'nama':current_user.nama,
        'email':current_user.email,
        'username':current_user.username,
        'saldo':current_user.saldo,
        'orderan':current_user.order_sum
    })

#------crud rute

@app.route('/rute/', methods=['POST'])
@token_req
def create_rute(current_user):
    if current_user.is_admin == True:
        data = request.get_json()
        if not 'rute' in data or not 'harga' in data:
            return {
                'message':'invalid data'
            }, 400
        x = rute(
            kota_asal = data['rute'],
            kota_tujuan = data['tujuan'],
            durasi = data['lama'],
            tarif = data['harga']
        )
        db.session.add(x)
        db.session.commit()
        return {
            'message':'input data berhasil'
        }
    else:
        return {
            'message':'You are not admin'
        }, 400

@app.route('/rute/<id>/', methods=['DELETE'])
@token_req
@cross_origin()
def delete_rute(current_user, id):
    if current_user.is_admin == True:
        rut = rute.query.filter_by(id=id).first_or_404()
        db.session.delete(rut)
        db.session.commit()
        return {
            'message':'berhasil hapus data'
        }
    else:
        return {
            'message':'unauthorized'
        }, 400

@app.route('/rute/<id>/', methods=['PUT'])
@token_req
def update_rute(current_user,id):
    if current_user.is_admin == True:
        data = request.get_json()
        rut = rute.query.filter_by(id=id).first_or_404()
        rut.kota_asal = data['rute']
        rut.kota_tujuan = data['tujuan']
        rut.durasi = data['lama']
        rut.tarif = data['harga']
        db.session.commit()
        return {
            'message':'update berhasil'
        }
    else:
        return {
            'message':'unauthorized'
        }

@app.route('/toprute/')
def toprute():
    x = db.engine.execute('select rute.kota_asal,kotatujuan, sum(quantity) from "order" left join rute on rute.id = "order".rute_id group by kotatujuan, rute.kota_asal order by  count(*) desc')
    k = []
    for i in x:
        k.append({'kota_asal':i[0], 'kota_tujuan': i[1], 'total': i[2]})
    return jsonify(k)

@app.route('/search-rute/<id>/')
def search_rute(id):
    aut_header = request.headers.get('Authorization')
    allow_user = is_authorized_user(aut_header)[0]
    allow_pass = is_authorized_user(aut_header)[1]
    user1 = user.query.filter_by(username=allow_user).filter_by(password=allow_pass).first()
    if not user1:
        return {
            'message':'unauthorized'
        }, 400
    else:
        x = db.engine.execute('select kota_asal,tarif from rute inner join jad_rute on jad_rute.id_rute = rute.id where jad_rute.id_schedule = {}'.format(id))
        k = []
        for i in x:
            k.append({'rute':i[0], 'tarif':i[1]})
        return jsonify(k)

@app.route('/rute/')
@token_req
def get_rute(current_user):
    return jsonify([{
        'id':x.id,
        'kota_asal':x.kota_asal,
        'kota_tujuan':x.kota_tujuan,
        'tarif':x.tarif,
        'durasi':str(x.durasi)
    } for x in rute.query.all()]
    )

#crud schedule

@app.route('/schedule/', methods=['POST'])
@token_req
def create_schedule(current_user):
    if current_user.is_admin == True:
        data = request.get_json()
        if not 'hari_berangkat' in data or not 'jam_berangkat' in data:
            return {
                'message':'invalid data'
            }, 400

        cars1 = car.query.filter_by(id=data['id_mobil']).first()
        print(cars1.id)
        if not cars1:
            return{
                'message cars':'error'
            }, 400

        rut = rute.query.filter_by(id=data['id_rute']).first()
        print(rut.id)
        if not rut:
            return{
                'message rute':rut
            }, 400


        x = schedule(
            hari = data['hari_berangkat'],
            jam = data['jam_berangkat'],
            temp_cap = cars1.kapasitas
        )
        x.sche_rut.append(rut)
        db.session.add(x)
        db.session.commit()
        return {
            'message':'berhasil input data'
        }
    else:
        return {
            'message':'unauthorized'
        }, 400

@app.route('/schedule/<id>/', methods=['DELETE']) 
@token_req
@cross_origin()
def delete_sche(current_user,id):
    if current_user.is_admin == True:
        data = schedule.query.filter_by(id=id).first()
        db.session.delete(data)
        db.session.commit()
        return {
            'message':'berhasil hapus data'
        }
    else:
        return {
            'message':'unauthorized'
        }, 400

@app.route('/schedule/<id>/', methods=['PUT'])
@token_req
def update_schedule(current_user,id):
    if current_user.is_admin == True:
        data = request.get_json()
        sche = schedule.query.filter_by(id=id).first_or_404()
        sche.hari = data['hari']
        sche.jam = data['jam']
        db.session.commit()
        return {
            'message':'update berhasil'
        }
    else:
        return {
            'message':'unauthorized'
        }, 400

@app.route('/search-schedule-rute', methods=['POST'])
def searchScheduleRute():
    data = request.get_json()

    k = db.engine.execute(f'''select kota_asal, kota_tujuan, schedule.id, car.id, rute.id, tarif, durasi, schedule.jam, car.spesifikasi from rute inner join jad_rute jr on jr.id_rute=rute.id inner join schedule on jr.id_schedule=schedule.id inner join car on rute.id=car.id_rute where rute.kota_asal ilike '{data['kota_asal']}%%' and rute.kota_tujuan ilike '{data['kota_tujuan']}%%' and schedule.hari ilike '{data['tanggal_berangkat']}%%' ''')
    x = []
    for i in k:
        x.append({
            'kota_asal':i[0],
            'kota_tujuan':str(i[1]),
            'id_schedule':i[2],
            'id_car':i[3],
            'id_rute':i[4],
            'tarif':i[5],
            'durasi':str(i[6]),
            'jam':str(i[7]),
            'merk':i[8]
        })

    return jsonify(x)

@app.route('/topschedule/')
@token_req
def top_schedule(current_user):
    if current_user.is_admin == True:
        x = db.engine.execute('select schedule.hari, tanggal, sum(quantity) from "order" left join schedule on schedule.id = "order".schedule_id group by tanggal, schedule.hari order by  count(*) desc')
        k = []
        for i in x:
            k.append({'hari':i[0], 'tanggal':str(i[1]), 'total':i[2]})
        return jsonify(k)
    else:
        return {
            'message':'kamu bukan admin'
        }

@app.route('/schedule/')
@token_req
def get_schedule(current_user):
    return jsonify([{
        'id':x.id,
        'hari':x.hari,
        'jam':str(x.jam)
    }for x in schedule.query.all()])

#crud car

@app.route('/car/', methods=['POST'])
@token_req
def create_car(current_user):
    data = request.get_json()
    if not 'kode' in data or not 'spesifikasi' in data or not 'kapasitas' in data:
        return {
            'message':'masukkan data dengan benar'
        }, 400
    if current_user.is_admin == True:
        rut = rute.query.filter_by(id=data['id_rute']).first_or_404()
        x = car(
            kode = data['kode'],
            spesifikasi = data['spesifikasi'],
            kapasitas = data['kapasitas'],
            id_rute = rut.id
        )
        db.session.add(x)
        db.session.commit()
        return {
            'message':'input data berhasil'
        }
    else:
        return {
            'message':'unauthorized'
        }, 400

@app.route('/car/<id>/', methods=['DELETE'])
@token_req
@cross_origin()
def delete_car(current_user,id):
    if current_user.is_admin == True:
        data = car.query.filter_by(id=id).first_or_404()
        db.session.delete(data)
        db.session.commit()
        return {
            'message':'berhasil hapus data'
        }
    else:
        return {
            'message':'unauthorized'
        }, 400

@app.route('/car/<id>/', methods=['PUT'])
@token_req
def update_cars(current_user,id):
    if current_user.is_admin == True:
        data = request.get_json()
        cars = car.query.filter_by(id=id).first()
        rut = rute.query.filter_by(id=data['id_rute']).first()
        if not rut:
            return jsonify({
                'm':rut
            })
        cars.kode = data['kode']
        cars.spesifikasi = data['spesifikasi']
        cars.kapasitas = data['kapasitas']
        cars.id_rute = rut.id
        db.session.commit()
        return {
            'message':'berhasil update data'
        }
    else:
        return {
            'message':'unauthorized'
        }, 400

@app.route('/car/')
@token_req
def get_car(current_user):
    return jsonify([{
        'id':x.id,
        'kode':x.kode,
        'merk':x.spesifikasi,
        'kapasitas':x.kapasitas
    }for x in car.query.all()])

#fitur lainnya

@app.route('/refund/<id>/', methods=['DELETE'])
@token_req
@cross_origin()
def refund_order(current_user, id):
    if not current_user:
        return {
            'message':'unauthorized'
        }, 400
    else:
        data = order.query.filter_by(id=id).first()
        sche = schedule.query.filter_by(id=data.schedule_id).first()
        # user2 = current_user.query.filter_by(id=data.user_id).first()
        current_user.saldo += data.total_harga
        sche.temp_cap += data.quantity
        current_user.order_sum -= 1
        db.session.delete(data)
        db.session.commit()
        return {
            'message':'selamat! kamu berhasil melakukan refund'
        }

@app.route('/topup/', methods=['PUT'])
@token_req
def topup(current_user):
    data = request.get_json()
    if current_user.saldo is None:
        current_user.saldo = int()
    current_user.saldo += data['topup']
    db.session.commit()
    return {
        'message':'berhasil topup! saldo anda kini sebesar Rp.'+str(current_user.saldo)
    }

@app.route('/order/', methods=['POST'])
@token_req
def create_order(current_user):
    data = request.get_json()
    rut = rute.query.filter_by(id=data['id_rute']).first()
    sche = schedule.query.filter_by(id=data['id_hari']).first()
    cars = car.query.filter_by(id=data['id_mobil']).first()
    x = order(
        user_id = current_user.id,
        rute_id = rut.id,
        schedule_id = sche.id,
        quantity = data['jumlah_tiket'],
        car_id = cars.id,
        nama = current_user.nama,
        kotaasal = rut.kota_asal,
        kotatujuan = rut.kota_tujuan,
        hari = sche.hari,
        mobil = cars.spesifikasi,
        tanggal = data['tanggal_berangkat'],
        jam = sche.jam
    )
    sche.temp_cap -= x.quantity
    if sche.temp_cap < 0:
        return {
            'message':'Maaf, keberangkatan untuk jadwal tersebut telah penuh, silahkan pilih jadwal lain'
        }
    
    today = datetime.date.today().strftime('%Y-%m-%d')
    if today > data['tanggal_berangkat']:
        sche.temp_cap = 40

    x.total_harga = x.quantity * rut.tarif
    if current_user.saldo < x.total_harga:
        return {
            'message':'saldo anda tidak cukup, silahkan topup terlebih dahulu.'
        }
    current_user.saldo -= x.total_harga
    if current_user.order_sum is None:
        current_user.order_sum = 0
    
    current_user.order_sum += 1
    db.session.add(x)
    db.session.commit()
    return {
        'message':'orderan berhasil'
    }

@app.route('/order/')
@token_req
def list_order(current_user):
    k = db.engine.execute(f'''select "order".nama, kotaasal, kotatujuan, jam, tanggal, mobil, hari, total_harga, "order".id from "order" inner join "user" on "user".id = "order".user_id where "user".id = '{current_user.id}' ''')
    x = []
    for i in k:
        x.append({
            'nama':i[0],
            'kota_asal':i[1],
            'kota_tujuan':i[2],
            'jam':str(i[3]),
            'tanggal':str(i[4]),
            'mobil':i[5],
            'hari':i[6],
            'total_harga':i[7],
            'id':i[8]
        })
    return jsonify(x)

@app.route('/login/', methods=['POST'])
def login():
    data = request.get_json()
    userlogin = user.query.filter_by(username=data['username']).first()

    if not userlogin:
        return jsonify({'message':'no user found'})

    if check_password_hash(userlogin.password ,data['password']):
        token = jwt.encode({
          'username':userlogin.username,
          'is_admin':userlogin.is_admin,
          'exp': datetime.datetime.utcnow()+datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        resp = make_response()
        resp.set_cookie('token', token)
        return resp

    if not(check_password_hash(userlogin.password, data['password'])):
        return jsonify({
            'message':'invalid password'
        })
    
@app.route('/profit/')
@token_req
def profit(current_user):
    if current_user.is_admin == True:
        k = db.engine.execute('select sum(total_harga) from "order"')
        x = []
        for i in k:
            x.append({
                'Total_profit':i[0]
            })
        return jsonify(x)
    else:
        return {
            'message':'kamu bukan admin'
        }

@app.route('/sumuser/')
@token_req
def sum_user(current_user):
    if current_user.is_admin == True:
        k = db.engine.execute('select count("user".id) from "user"')
        x = []
        for i in k:
            x.append({
                'jumlah_user':i[0]
            })
        return jsonify(x)
    else:
        return {
            'message':'kamu bukan admin'
        }

@app.route('/sumorder/')
@token_req
def sum_order(current_user):
    if current_user.is_admin == True:
        k = db.engine.execute('select count("order".id) from "order"')
        x = []
        for i in k:
            x.append({
                'jumlah_order':i[0]
            })
        return jsonify(x)
    else:
        return {
            'message':'kamu bukan admin'
        }

@app.route('/newuser/')
@token_req
def latest_user(current_user):
    if current_user.is_admin == True:
        k = db.engine.execute('select nama, email, "user".id from "user" order by id desc limit 4')
        x = []
        for i in k:
            x.append({
                'nama':i[0],
                'email':i[1]
            })
        return jsonify(x)
    else:
        return {
            'message':'kamu bukan admin'
        }

