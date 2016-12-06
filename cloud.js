var AV = require('leanengine');

/*
用户注册
 */
AV.Cloud.define('userSignUp', function (req, res) {
    var user = new AV.User();
    user.setUsername(req.params.username);
    user.setPassword(req.params.password);
    user.signUp().then(function (data) {
        res.success(data);
    }, function (err) {
        res.error(err);
    })
})

// 查询所有问答
AV.Cloud.define('getAllQuestion',function(request,response){
	var page = 0;
	var num = 20;
	var query = new AV.Query('question');
	query.equalTo('status','已回复');
	query.limit(num);
	query.skip(num*page);
	query.include('user','replyer');
	query.find().then(function(res){
		res.forEach(function(result){
			result.set('user',result.get('user') ? result.get('user').toJson() : null);
			result.set('replyer',result.get('replyer') ? result.get('replyer').toJson() : null);
		});
		response.success(res);
	},function(err){
		response.error(err);
	})

})

//新问答
AV.Cloud.define('postNewQuestion', function(request, response){
	var question = AV.Object.extend('question');
	var question = new question();
	var userinfo = AV.Object.createWithoutData('_User',request.params.userid);
	question.set('user',userinfo);
	question.set('content',request.params.content);
	question.set('price',request.params.price);
	question.set('status', '未回复');
	question.set('type','私密');
	question.save().then(function(data){
		response.success(data);
	},function(err){
		response.error(err);
	})
})

//回复问答
AV.Cloud.define('replyNewQuestion', function(request, response){
	var question = AV.Object.createWithoutData('question',request.params.questionid);
	var replyer = AV.Object.createWithoutData('_User',request.params.replyer);

	question.set('replyer',replyer);
	question.set('replyContent',request.params.replyContent);
	question.set('voiceUrl', request.params.voiceUrl);

	question.save().then(function(data){
		response.success(data);
	},function(err){
		response.error(err);
	})
})

//查询问答信息
AV.Cloud.define('getQuestion',function (request, response) {
	var query = new AV.Query('question');
	query.include('user','replyer');
	query.get(request.params.reqid).then(function (results) {
		if (results.get('user') != null) {
			results.set('user',results.get('user'.toJson()))
		}
		if (result.get('replyer') != null) {
			results.set('replyer', results.get('replyer').toJson())
		}
		response.success(results);
	},function (err) {
		response.error(err);
	})
})

// 获取用户所在地
AV.Cloud.define('getLocation', function (request, response) {
	var unirest = require("unirest");
	var req = unirest("POST", "http://apis.juhe.cn/get/");
	req.headers({
		"content-type" : "application/x-www-form-urlencoded"
	});
	req.send("lng=" + request.params.lng + "&lat=" + request.params.lat + "&type=1&key=3e095b9e2f05555e51455d28b1e403c8");
	req.end(function (res) {
		if (res.error) throw new Error(res.error);
		response.success(res.body.result.address);
	});
})

// 更新用户地址
AV.Cloud.define('updateLocation', function(request, response) {
	var user = AV.Object.createWithoutData('_User', request.params.userid);
	user.set('location', request.params.location);
	user.savae().then(function (res) {
		response.success(res);
	}, function (err) {
		response.error(err);
	})
})

// 获取用户的基础信息
AV.Cloud.define('updateUserInfo', function(request, response) {
	var user = AV.Object.createWithoutData('_User', request.params.userid);
	user.set('nickName', request.params.nickName);
	user.set('avatarUrl',request.params.avatarUrl);
	user.savae().then(function (res) {
		response.success(res);
	}, function (err) {
		response.error(err);
	})
})

/*
更新用户描述
*/
AV.Cloud.define('updateUserDesc', function (request, response) {
    var user = AV.Object.createWithoutData('_User', request.params.userid);
    user.set('desc', request.params.desc);
    user.save().then(function (res) {
        response.success(res);
    }, function (err) {
        response.error(err);
    })
})

/*
查询我提问的所有问题
*/
AV.Cloud.define('getMyQuestion', function (request, response) {
    var query = new AV.Query('question');
    var my = AV.Object.createWithoutData('_User', request.params.userid);
    query.equalTo('user', my);
    query.include('user', 'replyer')
    query.find().then(function (res) {
        res.forEach(function (obj) {
            if (obj.get('user') != null) {
                obj.set('user', obj.get('user').toJSON())
            }
            if (obj.get('replyer') != null) {
                obj.set('replyer', obj.get('replyer').toJSON())
            }
        }, this);
        response.success(res);
    }, function (err) {
        response.error(err);
    })
})

/*
查询我回答的所有问题
*/
AV.Cloud.define('getMyReply', function (request, response) {
    var query = new AV.Query('question');
    var my = AV.Object.createWithoutData('_User', request.params.userid);
    query.equalTo('replyer', my);
    query.include('user', 'replyer')
    query.find().then(function (res) {
        res.forEach(function (obj) {
            if (obj.get('user') != null) {
                obj.set('user', obj.get('user').toJSON())
            }
            if (obj.get('replyer') != null) {
                obj.set('replyer', obj.get('replyer').toJSON())
            }
        }, this);
        response.success(res);
    }, function (err) {
        response.error(err);
    })
})

/*
创建一个新的悬赏问题
*/
AV.Cloud.define('postNewReward', function (request, response) {
    var RQ = AV.Object.extend('RewardQuestion');
    var rq = new RQ();
    var my = AV.Object.createWithoutData('_User', request.params.userid);
    var now = new Date();
    rq.set('userid', my);
    rq.set('reward', request.params.price);
    rq.set('content', request.params.content);
    rq.set('time', now + 172800);
    rq.save().then(function (res) {
        response.success(res);
    }, function (err) {
        response.error(err);
    })
})

/*
创建一个新的悬赏回复
*/
AV.Cloud.define('replyReward',function(request,response){
    var rq = AV.Object.createWithoutData('RewardQuestion',request.params.questionid);
    var RA = AV.Object.extend('RewardAnswer');
    var ra = new RA();
    ra.set('RewardQuestion',rq);
    ra.set('replyContent', request.params.replyContent);
    ra.set('voiceUrl', request.params.voiceUrl);
    ra.save().then(function(res){
        response.success(res);
    },function(err){
        response.error(err);
    })
})

module.exports = AV.Cloud;
