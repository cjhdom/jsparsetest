/**
 * Created by jihwchoi on 2016-11-17.
 */
var serviceParser = require('../parser/serviceParser');

var serviceMap = new Map();
var clientMap = new Map();

//['getCartService', 'getCouponService', 'getDiscountService', 'getItemService', 'getMemberService', 'getOrderService', 'getPaymentService', 'getShippingService'];
serviceMap.set('getCartService', {domain: 'cart', path: 'lib/services/cart.js'});
serviceMap.set('getCouponService', {domain: 'coupon', path: 'lib/services/coupon.js'});
//serviceMap.set('getDiscountService', {domain: 'discount', path: 'lib/services/discount.js'});
serviceMap.set('getItemService', {domain: 'item', path: 'lib/services/item.js'});
serviceMap.set('getMemberService', {domain: 'member', path: 'lib/services/member.js'});
serviceMap.set('getOrderService', {domain: 'order', path: 'lib/services/order.js'});
serviceMap.set('getPaymentService', {domain: 'payment', path: 'lib/services/payment.js'});
serviceMap.set('getShippingService', {domain: 'shipping', path: 'lib/services/shipping.js'});
serviceMap.set('cartService', {domain: 'cart', path: 'services/cartService.js'});
serviceMap.set('couponService', {domain: 'coupon', path: 'services/couponService.js'});
serviceMap.set('discountService', {domain: 'discount', path: 'services/discountService.js'});
//serviceMap.set('itemService', {domain: 'item', path: 'services/itemService.js'});
serviceMap.set('memberService', {domain: 'member', path: 'services/memberService.js'});
serviceMap.set('orderService', {domain: 'order', path: 'services/orderService.js'});
serviceMap.set('paymentService', {domain: 'payment', path: 'services/paymentService.js'});
serviceMap.set('shippingService', {domain: 'shipping', path: 'services/shippingService.js'});

module.exports = exports = {};

serviceMap.forEach(function (value, key) {
    clientMap.set(key, serviceParser.parseService(key, value.path));
});

/**
 * 서비스 도메인을 불러온다
 * @param key
 * @returns {*}
 */
exports.getServiceMapper = function(key) {
  return serviceMap.get(key);
};

exports.getClientMapper = function(key) {
    return clientMap.get(key);
};
