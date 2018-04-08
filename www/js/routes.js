angular.module('starter.routes', [])
	.config(function ($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('auth', {
				url: '/auth',
				abstract: true,
				templateUrl: 'templates/auth/layout.html'
			})

			.state('auth.login', {
				url: '/login',
				params: {'forward': null},
				views: {
					'content': {
						templateUrl: 'templates/auth/login.html',
						controller: 'LoginCtrl'
					}
				}
			})

			.state("auth.register", {
				url: "/register",
				cache: false,
				views: {
					'content': {
						templateUrl: 'templates/auth/register.html',
						controller: 'RegisterCtrl'
					}
				}
			})

			.state("auth.resetPsd", {
				url: "/resetPsd",
				cache: false,
				views: {
					'content': {
						templateUrl: 'templates/auth/resetPsd.html',
						controller: 'ResetPsdCtrl'
					}
				}
			})

			.state('tab', {
				url: '/tab',
				abstract: true,
				templateUrl: 'templates/tabs.html'
			})

			.state('tab.my', {
				url: '/my',
				cache: false,
				views: {
					'tab-my': {
						templateUrl: 'templates/tabs/tab-my.html',
						controller: 'MyCtrl'
					}
				}
			})

			.state('tab.home', {
				url: '/home',
				views: {
					'tab-home': {
						templateUrl: 'templates/tabs/tab-home.html',
						controller: 'HomeCtrl'
					}
				}
			})

			.state('tab.class', {
				url: '/class',
				views: {
					'tab-class': {
						templateUrl: 'templates/tabs/tab-class.html',
						controller: 'ClassCtrl'
					}
				}
			})

			.state('user', {
				url: '/user',
				abstract: true,
				template: '<ion-nav-view></ion-nav-view>'
			})

			.state('user.center', {
				url: '/center',
				templateUrl: 'templates/user/center.html',
				controller: 'userCenterCtrl'
			})

			.state('user.info', {
				url: '/info',
				templateUrl: 'templates/user/info.html',
				controller: 'userInfoCtrl'
			})

			.state('user.safeSetup', {
				url: '/safe-setup',
				templateUrl: 'templates/user/safe-setup.html',
				controller: 'userSafesetupCtrl'
			})

			.state('user.user-help', {
				url: '/user-help',
				templateUrl: 'templates/user/user-help.html',
				controller: 'userHelpCtrl'
			})

			.state('user-help-details', {
				url: '/user-help-details/:id',
				templateUrl: 'templates/user/user-help-details.html',
				controller: 'userHelpDetailsCtrl'
			})

			.state('version', {
				url: '/version',
				templateUrl: 'templates/user/version.html',
				controller: 'userVersionCtrl'
			})

			.state('aboutUs', {
				url: '/aboutUs',
				templateUrl: 'templates/user/aboutUs.html',
				controller: 'userAboutUsCtrl'
			})

			.state('old-password', {
				url: '/old-password',
				templateUrl: 'templates/user/old-password.html',
				controller: 'userOldPasswordCtrl'
			})

			.state('home', {
				url: '/home',
				abstract: true,
				template: '<ion-nav-view></ion-nav-view>'
			})

			.state('home.articleDetails', {
				url: '/articleDetails/:id',
				params: {'id': null},
				templateUrl: 'templates/home/articleDetails.html',
				controller: 'homeArticleDetailsCtrl'
			})

			.state('home.agent', {
				url: '/agent',
				templateUrl: 'templates/home/agent.html',
				controller: 'homeAgentCtrl'
			})

			.state('home.member', {
				url: '/member',
				templateUrl: 'templates/home/member.html',
				controller: 'homeMemberCtrl'
			})

		$urlRouterProvider.otherwise('/auth/login');

	});
