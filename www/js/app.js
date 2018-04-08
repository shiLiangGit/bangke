// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.routes', 'starter.services', 'ngCordova', 'ngResource'])

	.run(function ($ionicPlatform, Message, $state, $ionicHistory, $cordovaSplashscreen, $rootScope, User, Storage) {
		$ionicPlatform.ready(function () {
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
			if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);

			}
			if (window.StatusBar) {
				// org.apache.cordova.statusbar required
				StatusBar.styleDefault();
			}
		});

		//监听设备状态
		document.addEventListener("deviceready", function () {
			//退出启动画面
			setTimeout(function () {
				try {
					$cordovaSplashscreen.hide();
				} catch (e) {
					console.info(e);
				}
			}, 700);
			// Jpush.init();// 极光推送
			// System.checkUpdate();//检查更新
		}, false);

		// 监听验证登陆
		$rootScope.$on('$stateChangeStart', function (event, toState) {
			var noNeedLogin = ['auth.login', 'auth.register', 'auth.resetPsd','oneLogin'];
			if(toState.name == "oneLogin"){
				if (window.StatusBar) {
					StatusBar.hide();
				}
			}else{
				if (window.StatusBar) {
					StatusBar.show();
				}
			}
			if (noNeedLogin.indexOf(toState.name) < 0 && !User.checkAuth()) {
				event.preventDefault(); //阻止默认事件，即原本页面的加载
				$state.go("auth.login");//跳转到登录页
				Message.show('请先登录', 1500);
			}
		});

		$rootScope.globalInfo = {
			pageMsg: Storage.get('user'), //全局user的数据
		};
		$rootScope.memCtr = true;

		//注册退出
		var exit = false;
		$ionicPlatform.registerBackButtonAction(function (e) {
			e.preventDefault();
			if ($location.path() == '/tab/home') {
				if (exit) {
					ionic.Platform.exitApp();
				} else {
					exit = true;
					Message.show('再按一次退出系统', "500");
					setTimeout(function () {
						exit = false;
					}, 2000);
				}
			} else if ($location.path() == '/auth/login') {
				$state.go('tab.home');
			}
			else if ($ionicHistory.backView()) {
				$ionicHistory.goBack();
			} else {
				exit = true;
				Message.show('再按一次退出系统', "500");
				setTimeout(function () {
					exit = false;
				}, 2000);
			}
			e.preventDefault();
			return false;
		}, 101);
	})
	.constant('ENV', {
		'REGULAR_MOBILE': /^1\d{10}$/,
		'API_URL': 'http://192.168.1.115:8100/api/dapp/1/api.dhc',

		// 'API_URL': 'http://develop.weiyuntop.com/dapp/1/api.dhc',
		'default_avatar': 'img/nav.png'
	})
	.config(function ($ionicConfigProvider) {
		$ionicConfigProvider.platform.ios.tabs.style('standard');
		$ionicConfigProvider.platform.ios.tabs.position('bottom');
		$ionicConfigProvider.platform.android.tabs.style('standard');
		$ionicConfigProvider.platform.android.tabs.position('bottom');
		$ionicConfigProvider.platform.ios.navBar.alignTitle('center');
		$ionicConfigProvider.platform.android.navBar.alignTitle('center');
		$ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
		$ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');
		$ionicConfigProvider.platform.ios.views.transition('ios');
		$ionicConfigProvider.platform.android.views.transition('android');
	})

	.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {
		$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
		$httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
		var param = function (obj) {
			var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
			for (name in obj) {
				value = obj[name];
				if (value instanceof Array) {
					for (i = 0; i < value.length; ++i) {
						subValue = value[i];
						fullSubName = name + '[' + i + ']';
						innerObj = {};
						innerObj[fullSubName] = subValue;
						query += param(innerObj) + '&';
					}
				}
				else if (value instanceof Object) {
					for (subName in value) {
						subValue = value[subName];
						fullSubName = name + '[' + subName + ']';
						innerObj = {};
						innerObj[fullSubName] = subValue;
						query += param(innerObj) + '&';
					}
				}
				else if (value !== undefined && value !== null)
					query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
			}
			return query.length ? query.substr(0, query.length - 1) : query;
		};
		$httpProvider.defaults.transformRequest = [function (data) {
			return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
		}];
		/*$httpProvider.defaults.headers.post['X-CSRFToken'] = 11;*/
		$httpProvider.interceptors.push('TokenAuth');
	});
