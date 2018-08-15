$(() => {
    const canvas = document.getElementById('canvasLOVE');

    const engine = new Shape.Engine(canvas);
    const promise = new Promise((resolve) => {
        resolve();
    });

    let secondFlag = false;
    let thridFlag = false;
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
                if (index === 0) {
                    startCanvasLOVE();
                } else if (index === 1 && !secondFlag) {
                    secondFlag = true;
                    startLOVEWord();
                } else if (index === 2){
                    startCanvasHeart(thridFlag);
                    thridFlag = true;
                } 
                // 每滑到一个index 即为当前index的生命周期 执行它的函数
            }
        }
    })

    function startLOVEWord() {
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

    function flower(context, x, y, n, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius || 20;
        this.color = '#DC143C';
        this.n = n || 10;
        this.rad = 2 * Math.PI * Math.random();
        this.context = context;
    };

    flower.prototype.drawPetal = function (i) {
        var delta = 0.3 + Math.random();
        var rand = this.radius * Math.random() + this.radius;

        this.context.beginPath();
        this.context.moveTo(
            this.x + Math.cos(this.rad) * 0.1,
            this.y + Math.sin(this.rad) * 0.1
        );
        this.context.fillStyle =
            "rgba(" +
            Math.floor(this.color.r * (1.25 - Math.random() * 0.5)) +
            "," +
            Math.floor(this.color.g * (1.25 - Math.random() * 0.5)) +
            "," +
            Math.floor(this.color.b * (1.25 - Math.random() * 0.5)) +
            "," +
            i +
            ")";
        this.context.bezierCurveTo(
            this.x + Math.cos(this.rad + delta) * rand * i,
            this.y + Math.sin(this.rad + delta) * rand * i,
            this.x + Math.cos(this.rad + 2 * delta) * rand * i,
            this.y + Math.sin(this.rad + 2 * delta) * rand * i,
            this.x + 0.1 * Math.cos(this.rad + 3 * delta),
            this.y + 0.1 * Math.sin(this.rad + 3 * delta)
        );
        this.context.strokeStyle = "rgba(55,55,55,0.1)";
        this.context.stroke();
        this.context.fill();
    };

    flower.prototype.drawBud = function (i) {
        var r = i || 1;
        var o = this;
        this.context.beginPath();
        this.context.arc(this.x, this.y, i, 0, 2 * Math.PI, false);
        this.context.fillStyle = "#fd86a2";
        this.context.fill();
        if (i++ < 4)
            setTimeout(function () {
                o.drawBud();
            }, 700);
    };

    flower.prototype.bloom = function () {
        var o = this;
        for (var i = 1; i < 7; i += 1)
            setTimeout(function () {
                o.drawPetal(i * i * 0.01);
            }, 10 * i);
        this.rad += 2.4;
    };

    flower.prototype.start = function () {
        var o = this;
        for (var i = 0; i < this.n; i++)
            setTimeout(function () {
                o.bloom();
            }, 100 * i);
        setTimeout(function () {
            o.drawBud(4);
        }, o.n * 100);
    };

    const canvasHeart = document.getElementById("canvasHeart");
    const context = canvasHeart.getContext("2d");
    canvasHeart.height = window.innerHeight;
    canvasHeart.width = window.innerWidth;
    canvasHeart.style.height = window.innerHeight;
    canvasHeart.style.width = window.innerWidth;

    const pi = Math.PI;
    let points = new Array();
    let num;

    const loveName = "大宝";

    var k = 0;
    var i = 50;
    var r = 1 / i;
    var g = 50 / i;
    var b = 50 / i;

    var offX = 190;
    var offY = 200;

    function getHeartPoint(c) {
        var r =
            (Math.sin(c) * Math.sqrt(Math.abs(Math.cos(c)))) / (Math.sin(c) + 1.4) -
            2 * Math.sin(c) +
            2;
        var x = 82 * Math.cos(c) * r;
        var y = -75 * Math.sin(c) * r;
        return new Array(x, y);
    }

    function dist(x0, y0, x1, y1) {
        return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
    }

    function drawHeart() {
        var last = new Array(0, 0);
        context.translate(offX, offY);
        for (var z = 4.7; z < 11; z += 0.04) {
            var h = getHeartPoint(z);
            if (dist(h[0], h[1], last[0], last[1]) < 40) continue;
            last[0] = h[0];
            last[1] = h[1];
            points.push(new flower(context, h[0], h[1], 7, 35));
        }
    }

    function drawFlowers() {
        points[num - 1 > 0 ? num - 1 : num].start();
        if (num-- > 0) setTimeout(drawFlowers, 130);
    }

    function drawText() {
        context.fillStyle = "rgba(255,100,50,0.05)";
        context.fillText("LOVE YOU", -120, 90);
    }

    function drawName() {
        context.fillStyle = "rgba(255,70,70,0.06)";
        context.fillText(loveName, -50, 170);
    }

    function startCanvasHeart(flag) {
        // 
        if(flag){
            context.translate(-offX, -offY);
        }
        context.clearRect(0,0,canvasHeart.width,canvasHeart.height);
        points = [];
	
        drawHeart();

        context.font = "50px 'fantasy'";

        for (var i = 0; i < 20; i++) {
            setTimeout(drawText, 120 * i);
        }
        setTimeout(function () {
            for (var i = 0; i < 20; i++) {
                setTimeout(drawName, 120 * i);
            }
        }, 3000);

        num = points.length;

        drawFlowers();
    }
})