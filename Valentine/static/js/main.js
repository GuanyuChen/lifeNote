$(()=>{
    const mySwiper = new Swiper('.swiper-container', {
        direction : 'vertical',
        on:{
            init: function(){
              swiperAnimateCache(this); //隐藏动画元素 
              swiperAnimate(this); //初始化完成开始动画
            }, 
            slideChangeTransitionEnd: function(){ 
              swiperAnimate(this); //每个slide切换结束时也运行当前slide动画
            } 
          }
    })
})