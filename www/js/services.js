angular.module('starter.services', [])
	// 本地缓存服务
	.factory('Storage', function () {
		return {
			set: function (key, data) {
				return window.localStorage.setItem(key, window.JSON.stringify(data));
			},
			get: function (key) {
				return window.JSON.parse(window.localStorage.getItem(key));
			},
			remove: function (key) {
				return window.localStorage.removeItem(key);
			}
		};
	})

	// 等待提示信息服务
	.factory('Message', function ($ionicLoading) {
		return {
			show: function () {
				var text = arguments[0] ? arguments[0] : 'Hi，出现了一些错误，请检查网络或者退出重试！';
				var duration = arguments[1] ? arguments[1] : 1200;
				var callback = arguments[2] ? arguments[2] : '';
				$ionicLoading.hide();
				if (typeof callback === "function") {
					$ionicLoading.show({
						noBackdrop: true,
						template: text,
						duration: duration
					}).then(function () {
						callback();
					});
				} else {
					$ionicLoading.show({
						noBackdrop: true,
						template: text,
						duration: duration
					});
				}
			},
			loading: function () {
				var text = arguments[0] ? arguments[0] : '';
				$ionicLoading.hide();
				$ionicLoading.show({
					hideOnStateChange: false,
					template: '<ion-spinner icon="spiral" class="spinner-stable"></ion-spinner><br/>' + text
				})
			},
			hidden: function () {
				$ionicLoading.hide();
			}
		};
	})

	// 读取本地缓存用户信息服务
	.factory('TokenAuth', function ($q, Storage, $location) {
		return {
			request: function (config) {
				var userInfo = Storage.get('user');
				config.headers = config.headers || {};
				if (userInfo && userInfo.token) {
					config.headers.TOKEN = userInfo.token;
				}
				return config;
			},
			response: function (response) {
				if (response.data.code === 403) {
					Storage.remove('user');
					$location.path('/auth/login');
				}
				return response || $q.when(response);
			}
		};
	})

	// 用户登录、注册、找回密码
	.factory('Auth', function ($resource, $rootScope, ENV, Message, $state, Storage) {
		var resource = $resource(ENV.API_URL + '?do=auth', {}, {
			query: {
				method: 'post',
				params: {
					op: '@op'
				},
				timeout: 6500
			}
		});
		function checkMobile(mobile) {
			if (!ENV.REGULAR_MOBILE.test(mobile)) {
				Message.show('请输入正确的11位手机号', 800);
				return false;
			}
			return true;
		}

		function checkPwd(pwd) {
			if (!pwd || pwd.length < 6) {
				Message.show('请输入正确的密码(最少6位)', 800);
				return false;
			}
			return true;
		}

		return {
			getoneLogin: function (success, error) {
				var res = $resource(ENV.API_URL + '?do=api');
				res.save({op: 'nav'}, success, error);
			},
			login: function (mobile, password) {
				if (!checkMobile(mobile)) {
					return false;
				}
				if (!checkPwd(password)) {
					return false;
				}
				Message.loading('登陆中……');
				resource.query({
					op: 'login',
					mobile: mobile,
					password: password
				}, function (response) {
					if (response.code !== 0) {
						Message.show(response.msg, 1500);
						return false;
					}
					Storage.set("user", response.data);
					Message.show('登陆成功', 1500);
					$state.go('tab.home');
				}, function () {
					Message.show('通信错误，请检查网络', 1500);
				});
			},

			//获取验证码
			getCaptcha: function (mobile, type) {
				if (!checkMobile(mobile)) {
					return false;
				}
				var _json = {
					op: 'register',
					type: 'send',
					mobile: mobile
				};
				if (type) {
					_json = {
						op: 'forget',
						type: 'send',
						mobile: mobile
					}
				}
				Message.loading();
				resource.query(_json, function (response) {
					if (response.code !== 0) {
						Message.show(response.msg);
						return false;
					}
					$rootScope.$broadcast('Captcha.send');
					Message.show(response.msg, 1000);
				}, function () {
					Message.show('通信错误，请检查网络!', 1500);
				});
			},

			//检查验证码
			checkCaptain: function (mobile,captcha, type) {
				if (!checkMobile(mobile)) {
					return false;
				}
				var _json = {
					op: 'register',
					type: 'verifycode',
					mobile: mobile,
					code: captcha
				};

				if (type) {
					_json = {
						op: 'forget',
						type: 'verifycode',
						mobile: mobile,
						code: captcha
					};
				}

				Message.loading();

				return resource.query(_json, function (response) {
					console.log(_json);
					console.log(response);
					if (response.code !== 0) {
						Message.show(response.msg, 1500);
						return;
					}
					$rootScope.$broadcast('Captcha.success');
					Message.show(response.msg, 1000);
				}, function () {
					Message.show('通信错误，请检查网络！', 1500);
				});
			},

			/*设置密码*/
			setPassword: function (reg, type) {
				if (reg.password.length < 6) {
					Message.show('密码长度不能小于6位！', 1500);
					return false;
				}
				if (reg.password != reg.repassword) {
					Message.show('两次密码不一致，请检查！', 1500);
					return false;
				}
				var _json = {
					op: 'register',
					mobile: reg.mobile,
					password: reg.password,
					repassword: reg.repassword,
					code: reg.captcha
				};

				if (type) {
					_json = {
						op: 'forget',
						mobile: reg.mobile,
						password: reg.password,
						repassword: reg.repassword,
						code: reg.captcha
					};
				}

				Message.loading();
				return resource.query(_json, function (response) {
					if (response.code !== 0) {
						Message.show(response.msg, 1500);
						return;
					}
					$state.go('auth.login');
					Message.show(response.msg, 1500);
				}, function () {
					Message.show('通信错误，请检查网络！', 1500);
				});
			},
			// 获取头像
			getUserLogo: function (success, error) {
				var res = $resource(ENV.API_URL + '?do=api');
				res.get({op: 'logo'}, success, error);
			}
		}
	})

	.factory('User', function ($resource, $rootScope, $q, $ionicLoading, ENV, $state, Message, $timeout, Storage) {
		return {
			checkAuth: function () {
				if (Storage.get('user') && Storage.get('user').uid != '') {
					return true;
				} else {
					return false;
				}
			},
			/*退出登录*/
			logout: function (type) {
				Storage.remove('user');
				if (type) {
					Message.show('密码修改成功，请重新登陆！', '1500', function () {
						$state.go("auth.login");
					});
				} else {
					Message.show('退出成功！', '1500', function () {
						$state.go("auth.login");
					});
				}
			},
			// 获取昵称
			getAvatar: function(success, error){
				var res = $resource(ENV.API_URL + '?do=user');
				Message.loading();
				res.get({op:'save',m:'helper'}, success, error);
			},
			//修改昵称
			saveAvatar: function (success, error, avatar, nickname, area, yunId, qq, email, idcard) {
				var resource = $resource(ENV.API_URL + '?do=user');
				Message.loading();
				var _json = {
						op: 'save',
						m:'helper',
						type:'save',
						avatar: avatar,
						nickname: nickname,
						area: area,
						yunId:yunId,
						qq:qq,
						email:email,
						idcard:idcard
				};
					resource.save(_json, success, error);
			},
			getCurrentUser: function () {
				if (!this.checkAuth()) {
					$ionicLoading.show({
						noBackdrop: true,
						template: '请登陆后操作！',
						duration: '1000'
					}).then(function () {
						$state.go("auth.login", {forward: forward})
					});
				}
				return Storage.get('user') || {};
			},
			/*修改登录密码*/
			updataPWD: function (success, error, psd, setpsd, rsetpsd) {
				var res = $resource(ENV.API_URL + '?do=user');
				res.save({
					op: 'updatePassword',
					userPassword: psd,
					password: setpsd,
					repassword: rsetpsd
				}, success, error);
			},
		};
	})

	.factory("Area", function ($resource, Message) {
		var resource = $resource("lib/area.json");
		return {
			getList: function (success, pid, cid) {
				resource.get({}, function (data) {
					success(data);
				});
			}
		}
	})

	.factory('Help', function ($resource, ENV, Message, $q) {
		var resorce = $resource(ENV.API_URL + '?do=user', {}, {
			query: {
				method: 'get',
				params: {
					op: '@op',
					id: "@id"
				},
				timeout: 5000
			}
		});

		return {
			getList: function () {
				var _q = $q.defer();
				resorce.query({
					op: 'help'
				}, function (response) {
					/*if (response.code != 0) {
					 Message.show(response.msg);
					 }*/
					_q.resolve(response);
				}, function (error) {
					_q.reject(error);
				});
				return _q.promise;
			},
			getDetail: function (id) {
				var _q = $q.defer();
				resorce.query({
					op: 'help',
					id: id
				}, function (response) {
					if (response.code != 0) {
						Message.show(response.msg);
					}
					_q.resolve(response);
				}, function (error) {
					_q.reject(error);
				});

				return _q.promise;
			}
		}
	})

	//读取系统后台配置
	.factory('Config', function ($resource, ENV) {
		var resource = $resource(ENV.API_URL + '?do=user');
		return {
			fetchAboutUs: function (success, error) {
				resource.get({op: 'config', type: 'aboutUs'}, success, error);
			},
			fetchVersion: function (success, error) {
				resource.get({op: 'config', type: 'version'}, success, error);
			}
		}
	})

	.factory('System', function ($http, $timeout, $ionicLoading, $ionicPopup, $cordovaInAppBrowser, $cordovaAppVersion, Message, ENV) {
		var verInfo;
		return {
			checkUpdate: function () {
				$http.get(ENV.API_URL + '?do=update&op=checkVersion').then(function (data) {
					verInfo = data.data.data;//服务器 版本
					$cordovaAppVersion.getVersionNumber().then(function (version) {
						if (version < verInfo.version) {
							var confirmPopup = $ionicPopup.confirm({
								template: '发现新版本，是否更新版本',
								buttons: [{
									text: '取消',
									type: 'button-default'
								}, {
									text: '更新',
									type: 'button-positive',
									onTap: function () {
										$cordovaInAppBrowser.open(verInfo.url, '_system');
									}
								}]
							});
						} else {
							return true;
						}
					}, function () {
						Message.show('通讯失败，请检查网络！');
					});
				}, false);
			}
		}
	})
	// 帮客课堂
	.factory('Category', function ($resource, $rootScope, $ionicLoading, $state, ENV, Message) {

		var resource = $resource(ENV.API_URL + '?do=book');
		return {
			// 定义课程分类服务
			getCategory: function (success, error) {
				Message.loading();
				resource.get({op: 'category', m: 'helper'}, success, error);
			},
			getCategoryList: function(success, error, id){
				var _json = {
					op: 'list',
					m: 'helper',
					cid: id
				};
				console.log(_json);
				Message.loading();
				resource.get( _json, success, error);
			},
			// 定义所有课程文章列表服务
			getAllLists: function(success, error){
				Message.loading();
				resource.get({op:'list',m:'helper'},success,error);
			}

		}


	})

	.factory('Home', function ($resource, ENV, Message) {
		var resource = $resource(ENV.API_URL + '?do=index&m=helper');
		return {
			//获取首页信息
			getIndexMsg: function (success, error) {
				var _json = {
					op: 'display'
				};
				resource.get(_json, success, error);
			},
			//获取文章详情
			getArticleDetails: function (success, error, id) {
				var res = $resource(ENV.API_URL + '?do=article&m=helper');
				var _json = {
					op: 'detail',
					id: id
				};
				res.get(_json, success, error);
			},
			//代理加盟
			getAgent: function (success, error) {
				var res = $resource(ENV.API_URL + '?do=user&m=helper');
				var _json = {
					op: 'userType'
				};
				res.get(_json, success, error);
			},
			//升级会员
			getMember: function (success, error) {
				var res = $resource(ENV.API_URL + '?do=user&m=helper');
				Message.loading();
				var _json = {
					op: 'userType'
				};
				res.get(_json, success, error);
			},
		}
	})

	.factory('Mc', function (Message, ENV, Storage, $rootScope, $resource) {
		var res = $resource(ENV.API_URL + '?do=mc');
		return {
			/*获取个人中心的数据*/
			getUserInfo: function (success, error) {
				Message.loading();
				var _json = {'op': 'display'};
				res.save(_json, success, error)
			}
		}
	})

	.factory('Payment', function ($resource, $rootScope, $ionicLoading, ENV, Message) {
		var payType = {};
		var resource = $resource(ENV.API_URL + '?do=payment');
		return {
			// 微信支付
			wechatPay: function (success, error) {
				Wechat.isInstalled('', function (reason) {
					Message.show('使用微信支付，请先安装微信', 2000);
				});
				Message.loading("正在打开微信支付！");
				var _json = {};
				_json = {
					op: 'getWechatDapp', /*, uid: userInfo.uid, signature: sign.signature, timestamp: sign.timestamp*/
					goodsInfo: info
				}

				resource.get(_json, function (response) {
					Message.hidden();
					wechatParams = response.data;
					var params = {
						partnerid: wechatParams.partnerid, // merchant id
						prepayid: wechatParams.prepayid, // prepay id
						noncestr: wechatParams.noncestr, // nonce
						timestamp: wechatParams.timestamp, // timestamp
						sign: wechatParams.sign // signed string
					};
					console.log(params)
					Wechat.sendPaymentRequest(params, function () {
						Message.show("支付成功");
						$rootScope.$broadcast('payTypeWechat.updated');
					}, function (reason) {
						console.log("支付失败: " + reason);
					});
				}, function () {
					Message.show("通信超时，请重试！");
				});
			},
			creditPay: function (success, error, info, order) {
				var _json = {};
				if(order == 'order'){
					_json = {
						op: 'getCreditDapp', /*, uid: userInfo.uid, signature: sign.signature, timestamp: sign.timestamp*/
						orderId: info
					}
				}else{
					_json = {
						op: 'getCreditDapp', /*, uid: userInfo.uid, signature: sign.signature, timestamp: sign.timestamp*/
						goodsInfo: info
					}
				}
				resource.get( _json, success, error)
			},
			creditShopPay: function (success, error, para) {
				resource.get({
					op: 'getCreditDapp', /*, uid: userInfo.uid, signature: sign.signature, timestamp: sign.timestamp*/
					model:'oto',
					money: para.money,
					spid: para.spid
				}, success, error)
			},
			getVoucher: function(success, error, userType, img, name, tel){
				var _json = {
					m:'helper',
					op:'getOffline',
					userType:userType,
					thumb:img,
					username:name,
					mobile:tel
				}
				Message.loading('保存中...');
				resource.save(_json, success, error);
			}
		}
	})
