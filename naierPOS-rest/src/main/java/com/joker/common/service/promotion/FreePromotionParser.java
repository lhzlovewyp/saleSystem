/**
 * 
 */
package com.joker.common.service.promotion;

import java.math.BigDecimal;
import java.util.List;

import org.apache.commons.collections.CollectionUtils;

import com.joker.common.dto.SaleDto;
import com.joker.common.dto.SaleInfo;
import com.joker.common.model.Material;
import com.joker.common.model.promotion.Promotion;
import com.joker.common.model.promotion.PromotionOffer;
import com.joker.common.model.promotion.PromotionOfferMatchContent;
import com.joker.common.service.MaterialService;
import com.joker.core.util.SpringBeanFactory;

/**
 * 赠送商品解析.
 * 
 * @author lvhaizhen
 *
 */
public class FreePromotionParser implements PromotionParser{

	private SaleDto saleDto;

	private Promotion promotion;

	private List<PromotionOffer> promotionOffers;
	
	public FreePromotionParser(SaleDto saleDto,Promotion promotion,List<PromotionOffer> promotionOffers){
		this.saleDto=saleDto;
		this.promotion=promotion;
		this.promotionOffers=promotionOffers;
	}
	
	@Override
	public SaleDto parsePromotion() {
		
		MaterialService materialService=(MaterialService)SpringBeanFactory.getBean("materialService");
		BigDecimal amount=new BigDecimal(0);
		//赠送商品优惠活动.
		for(PromotionOffer offer:promotionOffers){
			//赠品数量.
			BigDecimal num=offer.getOfferContent();
			List<PromotionOfferMatchContent> promotionOfferMatchContents =offer.getPromotionOfferMatchContents();
			if(CollectionUtils.isNotEmpty(promotionOfferMatchContents)){
				for(PromotionOfferMatchContent content :promotionOfferMatchContents ){
					Material m = materialService.getMaterialById(content.getId());
					if(m!=null){
						SaleInfo saleInfo=PromotionUtil.transToSaleInfo(m,saleDto.getSaleInfos().size());
						saleDto.getSaleInfos().add(saleInfo);
						amount=amount.add(saleInfo.getTotalPrice());
					}
				}
			}
		}
		//计算促销优惠价格.
		if(amount.intValue()>0){
			SaleInfo saleInfo=PromotionUtil.createPromotionSaleInfo(saleDto.getSaleInfos().size());
			saleInfo.setTotalPrice(amount.negate());
			saleDto.getSaleInfos().add(saleInfo);
		}
		
		return saleDto;
	}

}
