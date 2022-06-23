import base64
from base64 import decode
from sqlalchemy.orm import sessionmaker
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
db = SQLAlchemy(app)

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
    jalur = db.Column(db.String, nullable=False)
    tarif = db.Column(db.Integer, nullable=False)
    cars = db.relationship('car', backref='mobil', lazy='dynamic')
    sche_rut = db.relationship('schedule', secondary=jad_rute, backref='sche_rut', passive_deletes=True)
    order_rute = db.relationship('order', backref='jalan', lazy='dynamic')

    def __repr__(self):
        return f'rute<{self.jalur},{self.tarif}>'

class schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    tanggal = db.Column(db.Date, nullable=False)
    jam = db.Column(db.Time, nullable=False)
    order_jad = db.relationship('order', backref='jadwal', lazy='dynamic')
    rut_sche = db.relationship('rute', secondary=jad_rute, backref=('rut_sche'), passive_deletes=True)
    temp_cap = db.Column(db.Integer)

    def __repr__(self):
        return f'schedule<{self.tanggal},{self.jam}>'

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

@app.route('/')
def home():
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
    x = user(
        nama = data['name'],
        email = data['email'],
        username = data['username'],
        password = data['password'],
        is_admin = data.get('is_admin', False),
        order_sum = data['jumlah_order'],
        saldo = data['saldo']
    )
    db.session.add(x)
    db.session.commit()
    return {
        'name': x.nama, 'email': x.email,
        'username': x.username, 'password': x.password, 'is_admin': x.is_admin,
        'jumlah_order': x.order_sum, 'saldo': x.saldo
    }, 201

@app.route('/user/', methods=['PUT'])
def update_user():
    aut_header = request.headers.get('Authorization')
    allow_user = is_authorized_user(aut_header)[0]
    allow_pass = is_authorized_user(aut_header)[1]
    user1 = user.query.filter_by(username=allow_user).filter_by(password=allow_pass).first()
    if not user1:
        return {
            'message':'unauthorized'
        }, 400
    else:
        data = request.get_json()
        user1.nama = data['nama']
        user1.email = data['email']
        user1.username = data['username']
        user1.password = data['password']
        db.session.commit()
        return {
            'message':'berhasil update data'
        }

@app.route('/topuser/')
def topuser():
    x = db.engine.execute('select nama, order_sum from "user" order by order_sum desc limit 3')
    k = []
    for i in x:
        k.append({'nama':i[0], 'jumlah_order': i[1]})
    return jsonify(k)

# -----crud rute

@app.route('/rute/', methods=['POST'])
def create_rute():
    aut_header = request.headers.get('Authorization')
    allow_username = is_authorized_user(aut_header)[0]
    allow_password = is_authorized_user(aut_header)[1]
    user1 = user.query.filter_by(username=allow_username).filter_by(password=allow_password).first()
    if not user1:
        return {
            'message':'unauthorized'
        }, 400
    if user1.is_admin == True:
        data = request.get_json()
        if not 'rute' in data or not 'harga' in data:
            return {
                'message':'invalid data'
            }, 400
        x = rute(
            jalur = data['rute'],
            tarif = data['harga']
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

@app.route('/rute/<id>/', methods=['DELETE'])
def delete_rute(id):
    aut_header = request.headers.get('Authorization')
    allow_username = is_authorized_user(aut_header)[0]
    allow_pass = is_authorized_user(aut_header)[1]
    user1 = user.query.filter_by(username=allow_username).filter_by(password=allow_pass).first()
    if not user1:
        return {
            'message':'unauthorized'
        }, 400
    if user1.is_admin == True:
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
def update_rute(id):
    aut_header = request.headers.get('Authorization')
    allow_username = is_authorized_user(aut_header)[0]
    allow_pass = is_authorized_user(aut_header)[1]
    user1 = user.query.filter_by(username=allow_username).filter_by(password=allow_pass).first()
    if not user1:
        return {
            'message':'unauthorized'
        }, 400
    if user1.is_admin == True:
        data = request.get_json()
        rut = rute.query.filter_by(id=id).first_or_404()
        rut.jalur = data['rute']
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
    x = db.engine.execute('select rute.jalur,rute_id, count(rute_id) from "order" left join rute on rute.id = "order".rute_id group by rute_id, rute.jalur order by  count(*) desc')
    k = []
    for i in x:
        k.append({'nama_rute':i[0], 'id_rute': i[1], 'total': i[2]})
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
        x = db.engine.execute('select jalur,tarif from rute inner join jad_rute on jad_rute.id_rute = rute.id where jad_rute.id_schedule = {}'.format(id))
        k = []
        for i in x:
            k.append({'rute':i[0], 'tarif':i[1]})
        return jsonify(k)

#crud schedule

@app.route('/schedule/', methods=['POST'])
def create_schedule():
    aut_header = request.headers.get('Authorization')
    allow_username = is_authorized_user(aut_header)[0]
    allow_pass = is_authorized_user(aut_header)[1]
    user1 = user.query.filter_by(username=allow_username).filter_by(password=allow_pass).first()
    if not user1:
        return {
            'message':'unauthorized'
        }, 400
    if user1.is_admin == True:
        data = request.get_json()
        if not 'tanggal_berangkat' in data or not 'jam_berangkat' in data:
            return {
                'message':'invalid data'
            }, 400
        cars=car.query.filter_by(spesifikasi=data['mobil']).first()
        x = schedule(
            tanggal = data['tanggal_berangkat'],
            jam = data['jam_berangkat'],
            temp_cap = cars.kapasitas
        )
        rut = rute.query.filter_by(jalur=data['rute_jalan']).first()
        if not rut:
            return{
                'message':'invalid rute'
            }, 400
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
def delete_sche(id):
    aut_header = request.headers.get('Authorization')
    allow_username = is_authorized_user(aut_header)[0]
    allow_pass = is_authorized_user(aut_header)[1]
    user1 = user.query.filter_by(username=allow_username).filter_by(password=allow_pass).first()
    if not user1:
        return {
            'message':'unauthorized'
        }, 400
    if user1.is_admin == True:
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
def update_schedule(id):
    aut_header = request.headers.get('Authorization')
    allow_username = is_authorized_user(aut_header)[0]
    allow_pass = is_authorized_user(aut_header)[1]
    user1 = user.query.filter_by(username=allow_username).filter_by(password=allow_pass).first()
    if not user1:
        return {
            'message':'unauthorized'
        }, 400
    if user1.is_admin == True:
        data = request.get_json()
        sche = schedule.query.filter_by(id=id).first_or_404()
        sche.tanggal = data['tanggal']
        sche.jam = data['jam']
        db.session.commit()
        return {
            'message':'update berhasil'
        }
    else:
        return {
            'message':'unauthorized'
        }, 400

@app.route('/jadwal/<id>/')
def search_jadwal(id):
    aut_header = request.headers.get('Authorization')
    allow_user = is_authorized_user(aut_header)[0]
    allow_pass = is_authorized_user(aut_header)[1]
    user1 = user.query.filter_by(username=allow_user).filter_by(password=allow_pass).first()
    if not user1:
        return {
            'message':'unauthorized'
        }, 400
    else:
        h = db.engine.execute("select tanggal,jam from schedule inner join jad_rute on jad_rute.id_schedule = schedule.id where jad_rute.id_rute = {}".format(id))
        x = []
        for i in h:
            x.append({'tanggal':i[0], 'jam':str(i[1])})
        return jsonify(x)

@app.route('/topschedule/')
def top_schedule():
    x = db.engine.execute('select schedule.tanggal,schedule_id, count(schedule_id) from "order" left join schedule on schedule.id = "order".schedule_id group by schedule_id, schedule.tanggal order by  count(*) desc')
    k = []
    for i in x:
        k.append({'tanggal':i[0], 'id_tanggal':i[1], 'total':i[2]})
    return jsonify(k)

#crud car

@app.route('/car/', methods=['POST'])
def create_car():
    aut_header = request.headers.get('Authorization')
    allow_username = is_authorized_user(aut_header)[0]
    allow_pass = is_authorized_user(aut_header)[1]
    user1 = user.query.filter_by(username=allow_username).filter_by(password=allow_pass).first()
    data = request.get_json()
    if not user1:
        return {
            'message':'unauthorized'
        }, 400
    if not 'kode' in data or not 'spesifikasi' in data or not 'kapasitas' in data:
        return {
            'message':'masukkan data dengan benar'
        }, 400
    if user1.is_admin == True:
        rut = rute.query.filter_by(jalur=data['rute']).first_or_404()
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
def delete_car(id):
    aut_header = request.headers.get('Authorization')
    allow_username = is_authorized_user(aut_header)[0]
    allow_pass = is_authorized_user(aut_header)[1]
    user1 = user.query.filter_by(username=allow_username).filter_by(password=allow_pass).first()
    if not user1:
        return {
            'message':'unauthorized'
        }, 400
    if user1.is_admin == True:
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
def update_cars(id):
    aut_header = request.headers.get('Authorization')
    allow_username = is_authorized_user(aut_header)[0]
    allow_pass = is_authorized_user(aut_header)[1]
    user1 = user.query.filter_by(username=allow_username).filter_by(password=allow_pass).first()
    if not user1:
        return {
            'message':'unauthorized'
        }, 400
    if user1.is_admin == True:
        data = request.get_json()
        cars = car.query.filter_by(id=id).first_or_404()
        rut = rute.query.filter_by(jalur=data['rute']).first_or_404()
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

#fitur lainnya

@app.route('/refund/<id>/', methods=['DELETE'])
def refund_order(id):
    aut_header = request.headers.get('Authorization')
    allow_username = is_authorized_user(aut_header)[0]
    allow_pass = is_authorized_user(aut_header)[1]
    user1 = user.query.filter_by(username=allow_username).filter_by(password=allow_pass).first()
    if not user1:
        return {
            'message':'unauthorized'
        }, 400
    else:
        data = order.query.filter_by(id=id).first()
        sche = schedule.query.filter_by(id=data.schedule_id).first()
        user2 = user1.query.filter_by(id=data.user_id).first()
        if user1 != user2:
            return {
                'message':'unauthorized'
            }, 400
        user2.saldo += data.total_harga
        sche.temp_cap += data.quantity
        user2.order_sum -= 1
        db.session.delete(data)
        db.session.commit()
        return {
            'message':'selamat! kamu berhasil melakukan refund'
        }

@app.route('/topup/', methods=['PUT'])
def topup():
    aut_header = request.headers.get('Authorization')
    allow_user = is_authorized_user(aut_header)[0]
    allow_pass = is_authorized_user(aut_header)[1]
    user1 = user.query.filter_by(username=allow_user).filter_by(password=allow_pass).first()
    if not user1:
        return {
            'message':'unauthorized'
        }, 400
    else:
        data = request.get_json()
        if user1.saldo is None:
            user1.saldo = int()

        user1.saldo += data['topup']
        db.session.commit()
        return {
            'message':'berhasil topup! saldo anda kini sebesar Rp.'+str(user1.saldo)
        }

@app.route('/order/', methods=['POST'])
def create_order():
    aut_header = request.headers.get('Authorization')
    allow_user = is_authorized_user(aut_header)[0]
    allow_pass = is_authorized_user(aut_header)[1]
    user1 = user.query.filter_by(username=allow_user).filter_by(password=allow_pass).first()
    if not user1:
        return {
            'message':'unauthorized'
        }, 400
    else:
        data = request.get_json()
        user2 = user1.query.filter_by(nama=data['nama']).first()
        rut = rute.query.filter_by(jalur=data['rute']).first()
        sche = schedule.query.filter_by(tanggal=data['tanggal']).filter_by(jam=data['jam']).first()
        cars = car.query.filter_by(spesifikasi=data['mobil']).first()
        x = order(
            user_id = user1.id,
            rute_id = rut.id,
            schedule_id = sche.id,
            quantity = data['jumlah_tiket'],
            car_id = cars.id,
        )
        sche.temp_cap -= x.quantity
        if sche.temp_cap < 0:
            return {
                'message':'Maaf, keberangkatan untuk jadwal tersebut telah penuh, silahkan pilih jadwal lain'
            }
        x.total_harga = x.quantity * rut.tarif
        if user1.saldo < x.total_harga:
            return {
                'message':'saldo anda tidak cukup, silahkan topup terlebih dahulu.'
            }
        user1.saldo -= x.total_harga
        if user1.order_sum is None:
            user1.order_sum = 0
        
        user1.order_sum += 1
        db.session.add(x)
        db.session.commit()
        return {
            'message':'orderan berhasil'
        }
