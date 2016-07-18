app.factory('LoginService',['$q','$location','$http','BaseService',function($q,$location,$http,BaseService){
    var loginInfo = {hasLogin:false};
    return {
        login:function(condition){
            var deferred = $q.defer();
            BaseService.post('/rest/login', condition).then(function (obj) {
                if(obj && obj.data && obj.data.status == Status.SUCCESS) {
                    loginInfo = obj.data.data;
                    loginInfo.hasLogin = true;
                    loginInfo.loginerror = false;
                    $.cookie('userId',loginInfo.userId,{expires: 1});
                    $.cookie('nickName',loginInfo.nickName,{expires: 1});
                    $.cookie('token',loginInfo.token,{expires: 1});
                    $http.defaults.headers.common.token = loginInfo.token;
                }else{
                    loginInfo.hasLogin = false;
                    loginInfo.loginerror = true;
                    loginInfo.loginerroinfo = obj.data.msg;
                }
                deferred.resolve(loginInfo);
            });
            return deferred.promise;
        },
        updatePWD:function(condition){
        	var deferred = $q.defer();
        	var newPwd=condition.newPassword;
        	var reNewPwd=condition.reNewPassword;
        	var info={};
        	if(newPwd != reNewPwd){
        		info.updateStatus = false;
        		info.error=true;
        		info.errorInfo="2次输入的密码不一致";
        		deferred.resolve(info);
        	}else{
        		//修改密码.
        		 BaseService.post('/rest/account/updatePWD', condition).then(function (obj) {
                     if(obj && obj.data && obj.data.status == Status.SUCCESS) {
                         //info = obj.data.data;
                         info.error=false;
                         info.updateStatus = true;
                     }else{
                    	 info.updateStatus = false;
                    	 info.error = true;
                    	 info.errorInfo = obj.data.msg;
                     }
                     deferred.resolve(info);
                 });
        	}
        	return deferred.promise;
        },
        validateToken : function(){//获取当前用户信息
        	var deferred = $q.defer();
        	var token=$.cookie("token");
        	var obj={"token":token};
        	BaseService.post('/rest/login/validToken', obj).then(function (data) {
        		if(data.data.status == Status.SUCCESS){
        			loginInfo.userName=data.data.data.nick;
        			loginInfo.storeName=data.data.data.store.name;
        			deferred.resolve(loginInfo);
        		}else{
        			location.href = '/front/login.html';
        		}
        	});
        	return deferred.promise;
        },
        logOff : function(){
        	var token=$.cookie("token");
        	var obj={"token":token};
            BaseService.post('/rest/login/logout',obj).then(function(obj){
                if(obj.data.status==Status.SUCCESS){
                    $.cookie('token', '', { expires: -1 });
                    $.cookie('nickName',loginInfo.nickName,{expires: 1});
                    $.cookie('token',loginInfo.token,{expires: 1});
                    location.href = '/front/login.html'
                }
            });
        }
    }
}]);


app.factory('HomeService',['$q','$location','$http','BaseService',function($q,$location,$http,BaseService){
	return {
		getHomeData : function(){
			var token=$.cookie("token");
			var obj={"token":token};
			var deferred = $q.defer();
			var info={};
			BaseService.post('/rest/home/index',obj).then(function(obj){
                if(obj.data.status==Status.SUCCESS){
                    var dto=obj.data.data;
                	info.saleDate=dto.saleDate;
                	info.perTicketSales=dto.perTicketSales;
                	info.salesAmount = dto.salesAmount;
                	info.orders=dto.orders;
                	deferred.resolve(info);
                }
            });
			return deferred.promise;
		},
		dayReport : function(){
			var token=$.cookie("token");
			var obj={"token":token};
			var deferred = $q.defer();
			var info={};
			BaseService.post('/rest/home/dayReport',obj).then(function(obj){
               	info.status=obj.data.status;
            	deferred.resolve(info);
            });
			return deferred.promise;
		}
	}
	
}]);


app.factory('SaleService',['$q','$location','$http','BaseService',function($q,$location,$http,BaseService){
	return {
		initSalesOrder : function(){
			var token=$.cookie("token");
			var obj={"token":token};
			var deferred = $q.defer();
			var info={};
			BaseService.post('/rest/sale/initSaleOrder',obj).then(function(obj){
                if(obj.data.status==Status.SUCCESS){
                    var dto=obj.data.data;
                	info.saleDate=dto.saleDate;
                	info.itemDISC=dto.itemDISC;
                	info.allDISC=dto.allDISC;
                	deferred.resolve(info);
                }
            });
			return deferred.promise;
		},
		
		getShoppingGuide : function(condition){
			var token=$.cookie("token");
			condition.token=token;
			var deferred = $q.defer();
			var info={};
			BaseService.post('/rest/shoppingGuide/getShoppingGuide',condition).then(function(obj){
                if(obj.data.status==Status.SUCCESS){
                    var dto=obj.data.data;
                    info.data=dto;
                	deferred.resolve(info);
                }
            });
			return deferred.promise;
		},
		searchMat : function(condition){
			var token=$.cookie("token");
			if(!condition){
				return;
			}
			condition.token=token;
			var deferred = $q.defer();
			var info={};
			BaseService.post('/rest/m/getMaterialByCode',condition).then(function(obj){
                if(obj.data.status==Status.SUCCESS){
                    var dto=obj.data.data;
                    info.data=dto;
                	deferred.resolve(info);
                }
            });
			return deferred.promise;
		},
		getPromotions:function(condition){
			var token=$.cookie("token");
			if(!condition){
				return;
			}
			condition.token=token;
			var deferred = $q.defer();
			var info={};
			BaseService.post('/rest/sale/getPromotions',condition).then(function(obj){
                if(obj.data.status==Status.SUCCESS){
                    var dto=obj.data.data;
                    info.data=dto;
                	deferred.resolve(info);
                }
            });
			return deferred.promise;
		},
		cacPromotions:function(condition){//参加活动.
			var token=$.cookie("token");
			if(!condition){
				return;
			}
			condition.token=token;
			var deferred = $q.defer();
			var info={};
			BaseService.post('/rest/sale/cacPromotions',condition).then(function(obj){
				deferred.resolve(obj);
            });
			return deferred.promise;
		},
		submit:function(pay){
			var token=$.cookie("token");
			pay.token=token;
			var deferred = $q.defer();
			BaseService.post('/rest/sale/submit',pay).then(function(obj){
                deferred.resolve(obj);
            });
			return deferred.promise;
		}
	}
}]);	

app.factory('PayService',['$q','$location','$http','BaseService',function($q,$location,$http,BaseService){
	return {
		initPay : function(condition){
			if(!condition){
				condition={};
			}
			var token=$.cookie("token");
			condition.token=token;
			var deferred = $q.defer();
			var info={};
			BaseService.post('/rest/pay/initPay',condition).then(function(obj){
                if(obj.data.status==Status.SUCCESS){
                    var dto=obj.data.data;
                    info.data=dto;
                	deferred.resolve(info);
                }
            });
			return deferred.promise;
		}
	}
}]);	
	