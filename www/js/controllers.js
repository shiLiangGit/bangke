angular.module('starter.controllers', [])
	// 用户登录
	.controller('LoginCtrl', function ($scope, $state, $stateParams, $ionicLoading, Auth, Storage, Message) {
		$scope.user = {
			username: '',
			password: ''
		};
		console.log($scope.user.mobile);
		$scope.info = {};
		$scope.login = function () {
			var mobile = $scope.user.mobile || "";
			var password = $scope.user.password || "";
			Auth.login(mobile, password);
			$scope.user.mobile = "";

			$scope.user.password = "";
		};

		Auth.getUserLogo(function (response) {
			$scope.info = response.data
		},function (error) {
			Message.show(error.message);
		})
	})
	// 注册
	.controller('RegisterCtrl', function ($scope, Auth, $interval, Message) {
		$scope.reg = {captcha: null, mobile: null, password: null, repassword: null, number: 60, bol: false};
		$scope.showNext = 1;
		$scope.agree = true;
		// 同意注册协议切换按钮
		$scope.choose = function(){
			$scope.agree = !$scope.agree;
		}
		//获取短信验证码
		$scope.getCaptcha = function () {
			if($scope.showNext==1){
				Auth.getCaptcha($scope.reg.mobile);
			}else if($scope.showNext==2 && $scope.reg.number==60){
				Auth.getCaptcha($scope.reg.mobile);
			}
		};
		// 验证验证码，设置密码
		$scope.next = function () {
			if ($scope.showNext==2) {
				Auth.checkCaptain($scope.reg.mobile,$scope.reg.captcha);
			}else if ($scope.showNext==3){
				Auth.setPassword($scope.reg);
			}
		};
		//验证成功后
		$scope.$on("Captcha.success", function () {
			$scope.showNext = 3;
		});
		//发送验证后倒计时
		$scope.$on("Captcha.send", function () {
			$scope.showNext = 2;
			$scope.reg.bol = true;
			$scope.reg.number = 60;
			var timer = $interval(function () {
				if ($scope.reg.number <= 1) {
					$interval.cancel(timer);
					$scope.reg.bol = false;
					$scope.reg.number = 60;
				} else {
					$scope.reg.number--;
				}
			}, 1000)
		});
	})
	// 忘记密码
	.controller('ResetPsdCtrl', function ($scope, Auth, $interval, Message) {
		$scope.reg = {captcha: null, mobile: null, password: null, repassword: null, number: 60, bol: false};
		$scope.showNext = 1;
		//获取短信验证码
		$scope.getCaptcha = function () {
			Auth.getCaptcha($scope.reg.mobile, 1);
		};
		// 验证验证码
		$scope.next = function () {
			if ($scope.showNext==3) {
				Auth.setPassword($scope.reg, 1);
			} else if ($scope.showNext==1){
				Auth.checkCaptain($scope.reg.mobile, $scope.reg.captcha, 1);
			}
		};
		//验证成功后
		$scope.$on("Captcha.success", function () {
			$scope.showNext = 3;
		});
		//发送验证后倒计时
		$scope.$on("Captcha.send", function () {
			$scope.reg.bol = true;
			$scope.reg.number = 60;
			var timer = $interval(function () {
				if ($scope.reg.number <= 1) {
					$interval.cancel(timer);
					$scope.reg.bol = false;
					$scope.reg.number = 60;
				} else {
					$scope.reg.number--;
				}
			}, 1000)
		});
	})

	.controller('MyCtrl', function ($scope, ENV, $state, Storage, Message, $ionicLoading, $timeout, User, Mc) {
		$scope.$on('$ionicView.beforeEnter', function () {
			if (Storage.get('user') && Storage.get('user').uid != '') {
				$scope.userInfo = Storage.get('user');
			} else {
				$scope.userInfo = "";
			}
		});

		$scope.pageInfo = {};
		Mc.getUserInfo(function (response) {
			Message.hidden();
			$scope.pageInfo = response.data;
		}, function (error) {
			Message.show(error.message);
		});

		$scope.default_avatar = ENV.default_avatar;

	})

	.controller('userCenterCtrl', function ($scope, User, $state, System, Message, $ionicActionSheet, $ionicHistory, $ionicLoading, $timeout) {
		$scope.logout = function () {
			$ionicActionSheet.show({
				destructiveText: '退出登录',
				titleText: '确定退出当前登录账号么？',
				cancelText: '取消',
				cancel: function () {
					return true;
				},
				destructiveButtonClicked: function () {
					User.logout();
					$ionicHistory.nextViewOptions({    //退出后清除导航的返回
						disableBack: true
					});
					$ionicLoading.show({
						noBackdrop: true,
						template: '退出成功！',
						duration: '1500'
					});
					$timeout(function () {
						$state.go('auth.login');
					}, 1200);
					return true;
				}
			});
		}
		$scope.checkUpdate = function () {
			document.addEventListener("deviceready", function () {
				//检查更新
				if (!System.checkUpdate()) {
					Message.show("已经是最新版本！", 1500);
				}
			}, false);
		}
	})

	.controller('userInfoCtrl', function ($scope, $ionicActionSheet, ENV, User, $cordovaCamera, $timeout, $ionicModal, Area, $rootScope, $ionicScrollDelegate, Storage, Message, $state) {
		/*个人资料（头像跟昵称）*/
		$scope.up = {
			userInfo: User.getCurrentUser()
		};

		$scope.default_avatar = ENV.default_avatar;

		var _img = '';
		var selectImages = function (from) {
			var options = {
				quality: 85,
				destinationType: Camera.DestinationType.DATA_URL,
				sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
				allowEdit: false,
				encodingType: Camera.EncodingType.JPEG,
				targetWidth: 100,
				targetHeight: 100,
				correctOrientation: true,
				cameraDirection: 0
			};
			if (from == 'camera') {
				options.sourceType = Camera.PictureSourceType.CAMERA;
			}
			document.addEventListener("deviceready", function () {
				$cordovaCamera.getPicture(options).then(function (imageURI) {
					_img = imageURI;
					$scope.imgUrl = "data:image/jpeg;base64," + imageURI;
					var image = document.getElementById('myImage');
					image.src = $scope.imgUrl;
					// User.getImgUrl(imageURI);
				}, function () {
					Message.show('通讯错误,请检查网络', 1500);
				});
			}, false);
		};
		// 弹出选择图片
		$scope.uploadAvatar = function () {
			var buttons = [];
			if (ionic.Platform.isAndroid()) {
				buttons = [
					{text: "<i class='ion-android-camera t_shopsDetails_tableIcon'></i>拍一张照片"},
					{text: "<i class='ion-android-image t_shopsDetails_tableIcon'></i>从相册选一张"}
				]
			} else {
				buttons = [
					{text: "拍一张照片"},
					{text: "从相册选一张"}
				]
			}
			$ionicActionSheet.show({
				buttons: buttons,
				titleText: '请选择',
				cancelText: '取消',
				buttonClicked: function (index) {
					if (index == 0) {
						selectImages("camera");
					} else if (index == 1) {
						selectImages();
					}
					return true;
				}
			})
		};
		// 个人信息
		$scope.person = {
			yunId: '',
			qq: '',
			email: '',
			idcard: '',
		};
		// 进入页面请求个人信息
		User.getAvatar(function(response){
			Message.hidden();
			$scope.person = response.data;
		},function(error){
			Message.show(error.message)
		})

		// 保存图片
		$scope.saveAvatar = function () {
			var yunId = $scope.person.yunId || "";
			var qq = $scope.person.qq || "";
			var email = $scope.person.email || "";
			var idcard = $scope.person.idcard || "";

				// $scope.user.mobile = "";
				// $scope.user.password = "";

			var image = document.getElementById('myImage');
			console.log(Storage.get('user'));
			if (!_img && $scope.up.userInfo.nickname == Storage.get('user').nickname && $scope.up.userInfo.area == Storage.get('user').area && $scope.up.userInfo.yunId == Storage.get('user').yunId && $scope.up.userInfo.qq == Storage.get('user').qq && $scope.up.userInfo.idcard == Storage.get('user').idcard){
				Message.show('没有修改任何信息！');
				return;
			}

			if (!yunId) {
				Message.show('云联惠ID不能为空！');
				return;
			}
			if (!qq) {
				Message.show('QQ号码不能为空！');
				return;
			}
			if (!email) {
				Message.show('邮箱地址不能为空！');
				return;
			}
			if (!idcard) {
				Message.show('身份证号不能为空！');
				return;
			}

			if (!$scope.up.userInfo.area) {
				Message.show('请选择地区！');
				return;
			}

			User.saveAvatar(function (response) {
				Message.hidden();
				if (response.code != 0) {
					Message.show(response.msg);
					return;
				}
				$scope.up.userInfo.avatar = image.src;
				$scope.up.userInfo.yunId = yunId;
				$scope.up.userInfo.qq = qq;
				$scope.up.userInfo.email = email;
				$scope.up.userInfo.idcard = idcard;
				Storage.set('user', $scope.up.userInfo);
				$rootScope.globalInfo.pageMsg = $scope.up.userInfo;
				// 清空用户信息
				$scope.person.yunId = "";
				$scope.person.qq = "";
				$scope.person.email = "";
				$scope.person.idcard = "";

				$rootScope.$broadcast('userInfo.update');
				Message.show(response.msg, 2000);

				$state.go('user.center');
			}, function (error) {
				Message.show(error.message)
			}, _img, $scope.up.userInfo.nickname, $scope.up.userInfo.area, yunId, qq, email, idcard);
		};


		//修改昵称侧滑
		$scope.bolNone = false;
		$timeout(function () {
			$scope.bolNone = true;
		}, 1);
		$scope.bol = $scope.bolNone;
		$scope.changeBol = function () {
			$scope.bol = !$scope.bol;
		};

		// 我的地址
		$scope.areaList = {};
		$ionicModal.fromTemplateUrl('templates/user/area.html', {
			scope: $scope,
			animation: 'slide-in-left'
		}).then(function (modal) {
			$scope.area = modal;
		});
		$scope.openModal = function () {
			Area.getList(function (data) {
				$scope.areaList = $scope.areaData = data;
			});
			$scope.area.show();
		};
		$scope.selectArea = function (id) {
			$ionicScrollDelegate.scrollTop();
			var pid = id.substr(0, 2) + "0000";
			var cid = id.substr(0, 4) + "00";
			if (id.substr(0, 2) != "00" && id.substr(2, 2) != "00" && id.substr(4, 2) != "00") {
				$scope.up.userInfo.area = $scope.areaData[pid].title + " " + $scope.areaData[pid]['cities'][cid].title + " " + $scope.areaData[pid]['cities'][cid]['districts'][id];
				$scope.area.hide();
				return true;
			}
			if (id.substr(0, 2) != "00" && id.substr(2, 2) != "00") {
				$scope.areaList = $scope.areaData[pid]['cities'][id]['districts'];
				if ($scope.areaList.length <= 0) {
					$scope.up.userInfo.area = $scope.areaData[pid].title + " " + $scope.areaData[pid]['cities'][cid].title + " " + "其他（县/区）";
					$scope.area.hide();
				}
				return true;
			}
			if (id.substr(0, 2) != "00") {
				$scope.areaList = $scope.areaData[pid]['cities'];
				return true;
			}
		};
	})

	.controller('userSafesetupCtrl', function ($scope) {

	})

	.controller('userHelpCtrl', function ($scope, Storage, Message, Help) {
		$scope.info = {};

		function getList() {
			Help.getList().then(function (response) {
				$scope.$broadcast('scroll.refreshComplete');
				$scope.info.list = response.data;
				Storage.set('userHelp', response.data);
			}, function () {
				$scope.$broadcast('scroll.refreshComplete');
				Message.show('通讯错误，请检查网络!', 1000);
			})
		}

		$scope.reload = function () { //刷新帮助信息
			getList();
		};

		if (!Storage.get('userHelp')) {
			getList();
		} else {
			$scope.info.list = Storage.get('userHelp');
		}

	})

	.controller('userHelpDetailsCtrl', function ($scope, Message, Help, $stateParams) {
		$scope.info = {};
		$scope.info.id = $stateParams.id;
		Help.getDetail($scope.info.id).then(function (response) {
			$scope.info.detail = response.data;
		}, function (err) {
			Message.show(err.msg, 1000);
		})
	})

	/*版本中心*/
	.controller('userVersionCtrl', function ($scope, Storage, Config, Message) {
		$scope.reload = function () {
			getList();
		};
		// getList();

		function getList() {
			Config.fetchVersion(function (repon) {
				$scope.$broadcast('scroll.refreshComplete');
				$scope.version = repon.data;
				Storage.set('version', repon.data);
			}, function () {
				$scope.$broadcast('scroll.refreshComplete');
				Message.show('通讯错误，请稍后重试');
			})
		}

		if (!Storage.get('version')) {
			getList();
		} else {
			$scope.version = Storage.get('version');
		}
	})

	.controller('userAboutUsCtrl', function ($scope, Storage, Config, Message) {
		$scope.reload = function () {
			getList();
		};
		getList();
		function getList() {
			Config.fetchAboutUs(function (repon) {
				$scope.$broadcast('scroll.refreshComplete');
				$scope.aboutUs = repon.data;
				Storage.set('aboutUs', repon.data);
			}, function () {
				$scope.$broadcast('scroll.refreshComplete');
				Message.show('通讯错误，请稍后重试');
			})
		}

		if (!Storage.get('aboutUs')) {
			getList();
		} else {
			$scope.aboutUs = Storage.get('aboutUs');
		}
	})

	.controller('userOldPasswordCtrl', function ($scope, User, Message, $state) {
		$scope.mess = {
			old: {
				bol: true,
				psd: "",
				setpsd: "",
				rsetpsd: ""
			},
			bol: false
		};

		$scope.mess.testPsd = function (psd, setpsd, rsetpsd) {
			if (psd && psd.length >= 6 && setpsd && setpsd.length >= 6 && rsetpsd && rsetpsd.length >= 6 && rsetpsd == setpsd && rsetpsd != psd) {
				Message.loading();
				User.updataPWD(function (response) {
					Message.show(response.msg);
					$scope.mess.old.psd = "";
					$scope.mess.old.setpsd = "";
					$scope.mess.old.rsetpsd = "";
					if (response.code == 0) {
						User.logout(1);
						$state.go('auth.login');
					}
				}, function (error) {
					Message.show(error.message);
				}, psd, setpsd, rsetpsd);
			} else if (psd.length < 6 || setpsd.length < 6 || rsetpsd.length < 6) {
				Message.show('密码长度不能小于6位');
				return false;
			} else if (rsetpsd != setpsd) {
				Message.show('两次密码不一致');
				return false;
			} else if (psd == rsetpsd) {
				Message.show('修改密码不能与原密码相同');
				return false;
			}
		}
	})
	// 帮客课堂
	.controller('ClassCtrl', function ($scope, Category, $cordovaInAppBrowser, $ionicSideMenuDelegate, Message) {
		$scope.active = 1;
		$scope.category = {};
		$scope.lists = {};

		// 获取课程分类
			Category.getCategory(function(response){
				Message.hidden();
				$scope.category = response.data;
			},function(err){
				Message.show(err.message);
			})
		// 获取课程相关文章列表
			Category.getAllLists(function(response){
				Message.hidden();
				$scope.lists = response.data;
				console.log(response.data);
			},function(err){
				Message.show(err.message);
			})
		// 获取课程相关文章列表
		$scope.chooseCategory = function(cid){
			$scope.active = cid;
			Category.getCategoryList(function(response){
				Message.hidden();
				$scope.lists = response.data;
				console.log($scope.lists);
			},function(err){
				Message.show(err.message);
			},cid)
		}

	})
	.controller('HomeCtrl', function ($rootScope, $scope, User, $state, Home, Message, $http, $cacheFactory, $ionicSlideBoxDelegate, Storage, $sce ,$ionicPopup) {
		// 检查登陆
		$scope.$on('$ionicView.beforeEnter', function (event) {
			if (!User.checkAuth()) {
				$state.go('auth.login');
				event.preventDefault();
			}
			console.log($rootScope.globalInfo.pageMsg)
			
			$rootScope.globalInfo = {
				pageMsg: Storage.get('user')
			};
			console.log($rootScope.globalInfo.pageMsg)
			if ($rootScope.globalInfo && (!$rootScope.globalInfo.pageMsg.nickname || !$rootScope.globalInfo.pageMsg.area) && $rootScope.memCtr) {
				// Message.show("请先补全用户资料！");
				$scope.showConfirm();
				event.preventDefault();
			}
		});

		// 一个确认对话框
		$scope.showConfirm = function() {
			var confirmPopup = $ionicPopup.confirm({
				title: '温馨提示',
				template: '您的个人信息不完善，是否补全个人信息？',
				cancelText: '取消', // String (默认: 'Cancel')。一个取消按钮的文字。
				cancelType: '', // String (默认: 'button-default')。取消按钮的类型。
				okText: '确定', // String (默认: 'OK')。OK按钮的文字。
				okType: '', // String (默认: 'button-positive')。OK按钮的类型。
			});
			confirmPopup.then(function(res) {
				if(res) {
					$rootScope.memCtr = true;
					$state.go("user.info");
				}else{
					$rootScope.memCtr = false;
				}
			});
		};

		$scope.pageInfo = {
			data: {}
		};
		$rootScope.globalInfo = {
			pageMsg: Storage.get('user')
		};
		//获取首页信息
		Home.getIndexMsg(function (response) {
			$scope.pageInfo.data = response.data;
			console.log($scope.pageInfo.data);
			$scope.pageInfo.data.info = response.data.indexInfo;
			$scope.docHtml= $sce.trustAsHtml($scope.pageInfo.data.info);
			$ionicSlideBoxDelegate.$getByHandle("slideimgs").loop(true);
			$ionicSlideBoxDelegate.update();
		}, function (err) {
			Message.show(err.msg);
		});
	})

	.controller('homeArticleDetailsCtrl', function ($scope, Home, $stateParams, Message) {
		$scope.articleDetails = '';
		Home.getArticleDetails(function (response) {
			Message.hidden();
			$scope.articleDetails =response.data;
		}, function(error){
			Message.show(error.message)
		}, $stateParams.id)
	})

	.controller('homeAgentCtrl', function ($scope, Home, Message) {
		$scope.agent = '';
		Home.getAgent(function (response) {
			$scope.agent = response.data;
		}, function (error) {
			Message.show(error.message)
		})
	})

	.controller('homeMemberCtrl', function ($scope, $rootScope, Home, Message, $ionicModal, ENV, $cordovaCamera, $state,Payment, $ionicActionSheet) {
		$rootScope.memCtr = true;
		$scope.pageInfo = {
			data: {}
		};
		$scope.member = '';
		$scope.select = 1;
		$scope.selectPackage =function(name){
			$scope.select = name;
		}
		$scope.payType = 'wechat';
		$scope.selectPayType = function (type) {
			$scope.payType = type || 'wechat';
		};
		Home.getMember(function (response) {
			var _arr = [];
			Message.hidden();
			$scope.member = response.data;
			if(response.code == 301){
				Message.show(response.msg);
				$state.go('tab.account');
			}
			angular.forEach(response.data,function (v,key) {
				v.id = key;
				_arr.push(v);
			});
			$scope.select = _arr[0].id;

		}, function (error) {
			Message.show(error.message);
		})

		$ionicModal.fromTemplateUrl('templates/home/pay.html', {
			scope: $scope,
			animation: 'slide-in-left'
		}).then(function (modal) {
			$scope.pay = modal;
		});
		$scope.openModal = function () {
			$scope.pay.show();
		};

		$ionicModal.fromTemplateUrl('templates/home/upgradeMember.html', {
			scope: $scope,
			animation: 'slide-in-left'
		}).then(function (modal) {
			$scope.upgradeMember = modal;
		});

		$scope.orderConfirm = function () {
			if ($scope.payType == 'wechat') {
				if (!window.Wechat) {
					alert("暂不支持微信支付！");
					return false;
				}
				Payment.wechatPay(model);
			} else if ($scope.payType == 'alipay') {
				alert("证书尚未配置，请用微信支付！");

			} else if ($scope.payType == 'credit') {
				$scope.upgradeMember.show();
			}
		};

		$scope.uploadAvatar = function (type) {
			var buttons = [];
			if (ionic.Platform.isAndroid()) {
				buttons = [
					{text: "<i class='ion-android-camera t_shopsDetails_tableIcon'>拍一张照片</i>"},
					{text: "<i class='ion-android-image t_shopsDetails_tableIcon'>从相册选一张</i>"}
				]
			} else {
				buttons = [
					{text: "拍一张照片"},
					{text: "从相册选一张"}
				]
			}
			$ionicActionSheet.show({
				buttons: buttons,
				titleText: '请选择',
				cancelText: '取消',
				buttonClicked: function (index) {
					if (index == 0) {
						$scope.selectImages("camera", type);
					} else if (index == 1) {
						$scope.selectImages('', type);
					}
					return true;
				}
			})

		};
		/*上传凭证*/
		$scope.selectImages = function (from, type) {
			var options = {
				quality: 80,
				destinationType: Camera.DestinationType.DATA_URL,
				sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
				allowEdit: false,
				encodingType: Camera.EncodingType.JPEG,
				targetWidth: 1000,
				targetHeight: 600,
				correctOrientation: true,
				cameraDirection: 0
			};

			if (from == 'camera') {
				options.sourceType = Camera.PictureSourceType.CAMERA;
			}
			document.addEventListener("deviceready", function () {
				$cordovaCamera.getPicture(options).then(function (imageURI) {
					var image = document.getElementById('divImg');
					$scope.img = "data:image/jpeg;base64," + imageURI;
					image.style.backgroundImage = "url(data:image/jpeg;base64," + imageURI + ")";
				}, function (error) {
					Message.show('选择失败,请重试.', 1000);
				});
			}, false);
		};
		// 提交申请
		$scope.submit = function () {

			if (!$scope.pageInfo.data.username || $scope.pageInfo.data.username.length < 2) {
				Message.show('姓名不正确');
				return;
			}

			if (!ENV.REGULAR_MOBILE.test($scope.pageInfo.data.mobile)) {
				Message.show('手机号不正确');
				return;
			}

			if (!$scope.img) {
				Message.show('请上传支付凭证');
				return;
			}

			Payment.getVoucher(function (response) {
				Message.show(response.msg);
				$rootScope.memCtr = false;
				if(response.code == 1){
					$state.go("tab.my");
					return false;
				}
				$state.go("tab.my");
			}, function (error) {
				Message.show(error.message);
			}, $scope.select, $scope.img, $scope.pageInfo.data.username, $scope.pageInfo.data.mobile);
		}
	})
