package com.joker.common.controller;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.joker.common.model.Account;
import com.joker.common.model.ClientPayment;
import com.joker.common.service.ClientPaymentService;
import com.joker.common.third.pay.aliweixin.AliPayService;
import com.joker.common.third.pay.aliweixin.PayParamsVo;
import com.joker.common.third.pay.aliweixin.PayReturnVo;
import com.joker.core.annotation.NotNull;
import com.joker.core.cache.CacheFactory;
import com.joker.core.constant.ResponseState;
import com.joker.core.controller.AbstractController;
import com.joker.core.dto.ParamsBody;
import com.joker.core.dto.ReturnBody;
import com.joker.core.util.Configer;

/**
 * @author lvhaizhen
 *
 */
@RestController
public class PayController extends AbstractController {

	@Autowired
	ClientPaymentService clientPaymentService;
	
	
	@RequestMapping(value = { "/pay/initPay" }, method = RequestMethod.POST)
	@NotNull(value = "token")
	@ResponseBody
	public ReturnBody initPay(@RequestBody ParamsBody paramsBody,
			HttpServletRequest request, HttpServletResponse response) {
		ReturnBody rbody = new ReturnBody();
		String token = paramsBody.getToken();
		Object user = CacheFactory.getCache().get(token);
		if (user != null) {
			Account account = (Account) user;
			List<ClientPayment> clientPayments=clientPaymentService.getClientPayments(account.getClient().getId());
			rbody.setData(clientPayments);
			rbody.setStatus(ResponseState.SUCCESS);
		}
		return rbody;
	}
	
	
	/**
	 * 支付宝微信支付.
	 * */
	@RequestMapping(value = { "/pay/aliPay" }, method = RequestMethod.POST)
	@NotNull(value = "token")
	@ResponseBody
	public ReturnBody aliPay(@RequestBody ParamsBody paramsBody,
			HttpServletRequest request, HttpServletResponse response) {
		ReturnBody rbody = new ReturnBody();
		String token = paramsBody.getToken();
		Map<String,Object> body=paramsBody.getBody();
		Object user = CacheFactory.getCache().get(token);
		String channel=(String)body.get("channel");//支付管道 2-微信\1-支付宝.
		String code=(String)body.get("code");
		String salesDtoId=(String)body.get("salesDtoId");//销售单号.
		String tradeNo=(String)body.get("tradeNo");//交易号.
		String barcode=(String)body.get("barcode");
		String amount=(String)body.get("amount");//金额
		String salesDate=(String)body.get("salesDate");
		if (user != null) {
			Account account = (Account) user;
			PayParamsVo vo=new PayParamsVo();
			vo.setPartner(Configer.get("partner"));
			vo.setChannel(channel);
			vo.setCode(code);
			vo.setOut_trade_no(salesDate+"_"+salesDtoId);
			vo.setTrade_no(tradeNo);
			vo.setBarcode(barcode);
			vo.setSubject(salesDate+"_"+salesDtoId);
			vo.setTotal_fee(amount);
			vo.setOperator_id(account.getId());
			
			PayReturnVo returnVo=AliPayService.pay(vo);
			if(returnVo == null){
				rbody.setStatus(ResponseState.ERROR);
				return rbody;
			}
			if(returnVo.getState().equals("100")){
				rbody.setStatus(ResponseState.SUCCESS);
				rbody.setData(returnVo);
			}else{
				rbody.setStatus(ResponseState.FAILED);
				rbody.setMsg(returnVo.getMsg());
				rbody.setData(returnVo);
			}
		}else{
			rbody.setStatus(ResponseState.INVALID_USER);
			rbody.setMsg("请登陆.");
		}
		return rbody;
	}
	
	
	
}
