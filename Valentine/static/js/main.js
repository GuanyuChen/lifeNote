$(() => {
    const canvas = document.getElementById('canvasLOVE');

    const engine = new Shape.Engine(canvas);
    const promise = new Promise((resolve) => { resolve(); });

    let secondFlag = false;
    const mySwiper = new Swiper('.swiper-container', {
        direction: 'vertical',
        on: {
            init: function () {
                swiperAnimateCache(this); //隐藏动画元素 
                swiperAnimate(this); //初始化完成开始动画

                startCanvasLOVE();
            },
            slideChangeTransitionEnd: function () {
                swiperAnimate(this); //每个slide切换结束时也运行当前slide动画
            },
            slideChange: function () {
                console.log('当前index', mySwiper.activeIndex);

                let index = mySwiper.activeIndex;
                if(index === 0){
                    startCanvasLOVE();
                }else if(index === 1 && !secondFlag){
                    secondFlag = true;
                    startLOVEWord();
                }
                // 每滑到一个index 即为当前index的生命周期 执行它的函数
            }
        }
    })

    function startLOVEWord(){
        $('.loving-word').html('');

        $('.loving-word').typeIt({
            whatToType: ["喜欢我家大宝", "想天天看见ta"],
            typeSpeed: 100
        }, function () {
            console.log('ending')
        });   
    }

    function startCanvasLOVE() {
        promise.then(() => engine.toText('L'))
        .then(() => engine.shake())
        .then(() => engine.toText('O'))
        .then(() => engine.shake())
        .then(() => engine.toText('V'))
        .then(() => engine.shake())
        .then(() => engine.toText('E'))
        .then(() => engine.shake())
        .then(() => engine.toText('大宝'))    
    }
})