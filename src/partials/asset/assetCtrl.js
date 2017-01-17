/**
 * Created by zenking on 2017/1/6.
 */
angular.module('asch').controller('assetCtrl', function ($scope, $rootScope, apiService, ipCookie, $location, $window, NgTableParams,userService,postSerivice, $translate,$uibModal) {
    $rootScope.active = 'asset';
    $rootScope.userlogin = true;
    $rootScope.isBodyMask = false;
    //comfirmDialog
    $scope.comfirmDialog = false;
    //没有注册发行商
    $scope.init = function () {

        checkTab()
        apiService.issuer({
            address: userService.address
        }).success(function (res) {
            if (res.success == true) {
                // 已经注册发行商
                $scope.monname = res.issuer.name;
                $scope.mondesc = res.issuer.desc;
                userService.isStatus(true);
                userService.isName(res.issuer.name);
                $scope.issuerStatus = userService.issuerStatus;

            } else {
                // 没有发行商
                userService.isStatus(false);
                $scope.issuerStatus = userService.issuerStatus;

            }
        }).error(function (res) {
            toastError($translate.instant('ERR_SERVER_ERROR'));
        })
    };
    $scope.assetprofile = true;
    $scope.registerpublish = false;
    $scope.registerasset = false;
    $scope.myAssets = false;
    $scope.operationRecord = false;
    function checkTab(){
        switch(userService.tab)
        {
            case 1:
                $scope.assetprofilechange();
                break;
            case 2:
                $scope.registerpublishchange();
                break;
            case 3:
                $scope.registerAssetchange();
                break;
            case 4:
                $scope.myAssetschange();
                break;
            case 5:
                $scope.operationRecordchange();
                break;
            default:
                $scope.assetprofilechange();
        }
    }

    // 资产概况
    $scope.assetprofilechange = function () {
        $scope.assetprofile = true;
        $scope.registerpublish = false;
        $scope.registerasset = false;
        $scope.myAssets = false;
        $scope.operationRecord = false;
        userService.saveTab(1);
        if($scope.assetprofiletableparams){
            $scope.assetprofiletableparams.reload();
        } else {
        $scope.assetprofiletableparams = new NgTableParams({
            page: 1,
            count: 20,
            sorting: {
                height: 'desc'
            }
        }, {
            total: 0,
            getData: function ($defer, params) {
                apiService.myBalances({
                    limit: params.count(),
                    offset: (params.page() - 1) * params.count(),
                    address: userService.address
                }).success(function (res) {
                    params.total(res.count);
                    $defer.resolve(res.balances);
                }).error(function (res) {
                    toastError($translate.instant('ERR_SERVER_ERROR'));
                });
            }
        });
        }
    };
    //注册发行商tab
    $scope.registerpublishchange = function () {
        $scope.registerpublish = true;
        $scope.assetprofile = false;
        $scope.registerasset = false;
        $scope.myAssets = false;
        $scope.operationRecord = false;
        userService.saveTab(2);
    };
    //注册发行商
    $scope.registerPublish = function () {
        if(userService.issuerStatus){
            toastError('你已经注册了发行商');
            return false;
        }
        var name = $scope.monname;
        var desc = $scope.mondesc;
        if(!$scope.monname || !$scope.mondesc){
            return false;
        }

        if (!userService.secondPublicKey) {
            $scope.secondPassword = '';
        }
        $scope.publishtrs = AschJS.uia.createIssuer(name, desc, userService.secret, $scope.secondPassword);
        $scope.comfirmDialog = true;
        $scope.dialogNUM = 1;
        $rootScope.isBodyMask = true;
    };
    //注册资产tab
    $scope.registerAssetchange = function () {
        $scope.assetprofile = false;
        $scope.registerpublish = false;
        $scope.registerasset = true;
        $scope.myAssets = false;
        $scope.operationRecord = false;
        userService.saveTab(3);
    };
    //注册资产
    $scope.registerAsset = function () {
        if(!userService.issuerStatus){
            toastError('你还没有注册发行商');
            return false;
        }
        var reg = /^[A-Z]{3,6}$/;
        if(!reg.test($scope.publishName)){
            toastError('请输入3-6位大写字母');
            return false;
        }
        var name = $scope.monname +'.'+ $scope.publishName;
        var desc = $scope.publishDesc;
        var maximum = $scope.topLimt;
        var precision = $scope.precision;
        var strategy = $scope.strategy;
        if (!userService.secondPublicKey) {
            $scope.secondPassword = '';
        };
        $scope.assetTrs = AschJS.uia.createAsset(String(name), String(desc), String(maximum)  , +precision, strategy, userService.secret, $scope.secondPassword);
        $scope.dialogNUM = 2;
        $scope.comfirmDialog = true;
        $rootScope.isBodyMask = true;
    };
    //我的资产tab
    $scope.myAssetschange = function () {
        $scope.assetprofile = false;
        $scope.registerpublish = false;
        $scope.registerasset = false;
        $scope.myAssets = true;
        $scope.operationRecord = false;
        userService.saveTab(4);
        // if(!userService.issuerStatus){
        //     toastError('没有资产相关记录');
        //     return false;
        // }
        if($scope.myAss){
            $scope.myAss.reload();
        } else {
            $scope.myAss = new NgTableParams({
                page: 1,
                count: 10
            }, {
                total: 0,
                page: 1,
                count: 20,
                counts: [],
                getData: function ($defer, params) {
                    apiService.myAssets({
                        name: userService.name,
                        limit: params.count(),
                        offset: (params.page() - 1) * params.count()
                    }).success(function (res) {
                        params.total(res.count);
                        $defer.resolve(res.assets);
                    }).error(function (res) {
                        toastError($translate.instant('ERR_SERVER_ERROR'));
                    });
                }
            });
        }

    };
    //操作记录
    $scope.operationRecordchange = function () {
        $scope.assetprofile = false;
        $scope.registerpublish = false;
        $scope.registerasset = false;
        $scope.myAssets = false;
        $scope.operationRecord = true;
        userService.saveTab(5);
        if($scope.operationRecordparams){
            $scope.operationRecordparams.reload()
        } else {
        $scope.operationRecordparams = new NgTableParams({
            page: 1,
            count: 20
        }, {
            total: 0,
            counts: [],
            getData: function ($defer,params) {
                apiService.myAssetTransactions({
                    ownerPublicKey:userService.publicKey,
                    limit: params.count(),
                    offset: (params.page() - 1) * params.count()
                }).success(function (res) {
                    params.total(res.count);
                    $defer.resolve(res.transactions);
                }).error(function (res) {
                    toastError($translate.instant('ERR_SERVER_ERROR'));
                });
           }
        });
        }
    };
    //myWriteOff
    $scope.myWriteOff = function (i) {
        $scope.moneyName = i.name
        $rootScope.isBodyMask = true;
        $scope.myAss.writeoff = true;
    };
    $scope.writeoff_submit = function () {
        var currency = $scope.moneyName;
        var flagType = 2;
        var flag =1;
        if (!userService.secondPublicKey) {
            $scope.secondPassword = '';
        }
        var transaction = AschJS.uia.createFlags(currency, flagType, flag,userService.secret, $scope.secondPassword);
        postSerivice.writeoff(transaction).success(function (res) {
            if (res.success == true) {
                $scope.secondPassword = '';
                $scope.myAss.writeoff = false;
                $rootScope.isBodyMask = false;
                toast($translate.instant('INF_OPERATION_SUCCEEDED'));
            } else {
                toastError(res.error)
            };
        }).error(function (res) {
            toastError($translate.instant('ERR_SERVER_ERROR'));
        });
    }
    $scope.writeoffClose = function () {
        $rootScope.isBodyMask = false;
        $scope.myAss.writeoff = false;
    };
    // // 发行
    $scope.myPublish = function (i) {
        $scope.myAss.publish = true;
        $scope.myPublishmoneyName = i.name;
        $rootScope.isBodyMask = true;
    };
    $scope.publish_submit = function () {
        $scope.myAss.publish = false;
        $rootScope.isBodyMask = false;
        if(!$scope.myPublishmoneyName){
            return ;
        }
        var trs = AschJS.uia.createIssue($scope.myPublishmoneyName, $scope.amount, userService.secret, $scope.secondPassword);
        postSerivice.writeoff(trs).success(function (res) {
            if (res.success == true) {
                $scope.secondPassword = '';
                $scope.myAss.publish = false;
                $rootScope.isBodyMask = false;
                toast($translate.instant('INF_OPERATION_SUCCEEDED'));
            } else {
                toastError(res.error)
            };
        }).error(function (res) {
            toastError($translate.instant('ERR_SERVER_ERROR'));
        });
    }
    $scope.publishClose = function () {
        $rootScope.isBodyMask = false;
        $scope.myAss.publish = false;
    };
    $scope.models = [
        { value: 0, name: '黑名单模式' },
        { value: 1, name: '白名单模式' }
    ];
    $scope.mymodel = $scope.models[1];

    // 设置
    $scope.mySettings = function (i) {
        $scope.moneyName = i.name;
        if(i.acl == 0){
            $scope.acl = 1;
        } else if (i.acl == 1){
            $scope.acl = 0;
        }

        $scope.myAss.set = true;
        $rootScope.isBodyMask = true;
    };
    $scope.settings_submit = function () {
        $scope.myAss.set = false;
        $rootScope.isBodyMask = false;
        var currency = $scope.moneyName;
        var flagType = 1;
        var flag = $scope.acl;
        if (!userService.secondPublicKey) {
            $scope.secondPassword = '';
        }
        var trs = AschJS.uia.createFlags(currency, flagType, flag, userService.secret, $scope.secondPassword);
        postSerivice.writeoff(trs).success(function (res) {
            if (res.success == true) {
                $scope.myAss.set = false;
                $rootScope.isBodyMask = false;
                toast($translate.instant('INF_OPERATION_SUCCEEDED'));
            } else {
                toastError(res.error)
            };
        }).error(function (res) {
            toastError($translate.instant('ERR_SERVER_ERROR'));
        });
    };
    $scope.settingsClose = function () {
        $rootScope.isBodyMask = false;
        $scope.myAss.set = false;
    };
    //关闭确认
    $scope.comfirmDialogClose = function () {
        $rootScope.isBodyMask = false;
        $scope.comfirmDialog = false;
    };
    $scope.comfirmSub = function () {
        var trs ;
        if($scope.dialogNUM == 1){
            trs = $scope.publishtrs;

        } else if($scope.dialogNUM == 2){
            trs = $scope.assetTrs;
        }
        postSerivice.post(trs).success(function (res) {
            if (res.success == true) {
                if($scope.dialogNUM == 1){
                    $scope.monname = '';
                    $scope.mondesc = '';
                    userService.isName($scope.monname);
                } else if($scope.dialogNUM == 2){
                    $scope.publishName = '';
                    $scope.publishDesc = '';
                    $scope.topLimt = '';
                    $scope.precision = '';
                    $scope.strategy = '';
                }
                toast($translate.instant('INF_OPERATION_SUCCEEDED'));
                $scope.comfirmDialogClose();
            } else {
                toastError(res.error)
            }
        }).error(function (res) {
            toastError($translate.instant('ERR_SERVER_ERROR'));
        });
    };

    $scope.myAddPlus = function (i) {

        $rootScope.addACL = i;
        $location.path('/add-acl');
    };
    // //-ACL
    $scope.myreduceACL = function (i) {
        $rootScope.reduceACL = i;
        $location.path('/reduce-acl');
    };
    $scope.transferView= function (i,num) {
       var data ;
        if(num == 1){
            data = i.currency;
        } else if(num == 2){
            data = i.name;
        }
        $rootScope.currencyName = data;
        $rootScope.precision = i.precision;
        $location.path('/pay');
    };


});
