var Mongotest = require('mongotest');
var mongo = new Mongotest();

var Model = require('live/model');

exports.testRegisterAppCode = function(test) {

    mongo.isStarted(mongo.ensureDeleted("aaa", mongo.ensureDeleted("bbb", function() {

        var appCollection = mongo.db.collection('app');
        var phoneCollection = mongo.db.collection('phone');
        var model = new Model(appCollection, phoneCollection);

        model.registerAppCode('code', 'url', function(err) {
            
            test.ok(!err);
            appCollection.findOne(function(err, item) {
                test.ok(!err);
                test.deepEqual({_id: 'code' ,url: 'url'}, item);
                test.done(); 
            });
        });

    })), function() {
        console.log('mongo is not started');
        test.done();
    });
};

exports.testRegisterPhone = function(test) {

    mongo.isStarted(mongo.ensureDeleted("aaa", mongo.ensureDeleted("bbb", function() {

        var appCollection = mongo.db.collection('app');
        var phoneCollection = mongo.db.collection('phone');
        var model = new Model(appCollection, phoneCollection);

        model.registerAppCode('code2', 'url2', function(err) {
            
            test.ok(!err);
            model.registerPhone('5566', 'code2', function(err2, resp) {
                test.ok(!err2);
                test.ok(resp);

                phoneCollection.findOne({_id: '5566'}, function(err3, phone) {
                    
                    test.ok(!err3);
                    test.deepEqual(phone, {
                        _id: '5566',
                        appCode: 'code2',
                        appUrl: 'url2'
                    });
                    test.done();
                });
            });
        });

    })), function() {
        console.log('mongo is not started');
        test.done();
    });
};

exports.testRegisterPhoneNoAppCode = function(test) {

    mongo.isStarted(mongo.ensureDeleted("aaa", mongo.ensureDeleted("bbb", function() {

        var appCollection = mongo.db.collection('app');
        var phoneCollection = mongo.db.collection('phone');
        var model = new Model(appCollection, phoneCollection);

        model.registerPhone('5566', 'code5', function(err2, resp) {
            test.ok(!err2);
            test.ok(!resp);

            phoneCollection.findOne({_id: '5566'}, function(err3, phone) {
                
                test.ok(!err3);
                test.ok(phone, null);
                test.done();
            });
        });

    })), function() {
        console.log('mongo is not started');
        test.done();
    });
};

exports.testDeRegisterPhone = function(test) {

    mongo.isStarted(mongo.ensureDeleted("aaa", mongo.ensureDeleted("bbb", function() {

        var appCollection = mongo.db.collection('app');
        var phoneCollection = mongo.db.collection('phone');
        var model = new Model(appCollection, phoneCollection);

        model.registerAppCode('code2', 'url2', function(err) {
            
            test.ok(!err);
            model.registerPhone('5566', 'code2', function(err2, resp) {
                test.ok(!err2);
                test.ok(resp);

                phoneCollection.findOne({_id: '5566'}, function(err3, phone) {
                    
                    test.ok(!err3);
                    test.deepEqual(phone, {
                        _id: '5566',
                        appCode: 'code2',
                        appUrl: 'url2'
                    });
                    
                    model.deregisterPhone('5566', afterDeregistered);
                });
            });
        });

        function afterDeregistered(err) {
            
            test.ok(!err);

            phoneCollection.findOne({_id: '5566'}, function(err, phone) {
                
                test.ok(!err);
                test.equal(phone, null);
                
                test.done();                
            });
        }

    })), function() {
        console.log('mongo is not started');
        test.done();
    });
};

exports.testGetAppUrlbyPhone = function(test) {

    mongo.isStarted(mongo.ensureDeleted("aaa", mongo.ensureDeleted("bbb", function() {

        var appCollection = mongo.db.collection('app');
        var phoneCollection = mongo.db.collection('phone');
        var model = new Model(appCollection, phoneCollection);

        model.registerAppCode('code3', 'url3', function(err) {
            
            test.ok(!err);
            model.registerPhone('5564', 'code3', function(err2, resp) {
                test.ok(!err2);
                test.ok(resp);

                model.getAppUrlByPhone('5564', function(err3, resp) {
                    test.ok(!err3);
                    test.equal(resp, 'url3');
                    test.done();
                });
            });
        });

    })), function() {
        console.log('mongo is not started');
        test.done();
    });
};

exports.testGetAppUrlbyPhoneNoPhone = function(test) {

    mongo.isStarted(mongo.ensureDeleted("aaa", mongo.ensureDeleted("bbb", function() {

        var appCollection = mongo.db.collection('app');
        var phoneCollection = mongo.db.collection('phone');
        var model = new Model(appCollection, phoneCollection);

        model.registerAppCode('code3', 'url3', function(err) {
            
            test.ok(!err);
            model.getAppUrlByPhone('5566', function(err3, resp) {
                test.ok(!err3);
                test.equal(resp, false);
                test.done();
            });
        });

    })), function() {
        console.log('mongo is not started');
        test.done();
    });
};

exports.testGetPhonesByAppCode = function(test) {

    mongo.isStarted(mongo.ensureDeleted("aaa", mongo.ensureDeleted("bbb", function() {

        var appCollection = mongo.db.collection('app');
        var phoneCollection = mongo.db.collection('phone');
        var model = new Model(appCollection, phoneCollection);

        model.registerAppCode('code3', 'url3', function(err) {
            
            test.ok(!err);
            model.registerPhone('2000', 'code3', function(err2, resp) {
                test.ok(!err2);
                test.ok(resp);

                model.registerPhone('3000', 'code3', function(err2, resp) {
                    test.ok(!err2);
                    test.ok(resp);

                    model.getPhonesByAppCode('code3', function(err3, resp) {
                        test.ok(!err3);
                        test.ok(resp.indexOf('3000') >= 0);
                        test.ok(resp.indexOf('2000') >= 0);
                        test.done();
                    });
                });
            });
        });

    })), function() {
        console.log('mongo is not started');
        test.done();
    });
};