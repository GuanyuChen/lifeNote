$(() => {
    let secondFlag = false;
    let thridFlag = false;
    const mySwiper = new Swiper('.swiper-container', {
        direction: 'vertical',
        on: {
            init: function () {
                swiperAnimateCache(this); //隐藏动画元素 
                swiperAnimate(this); //初始化完成开始动画
                console.log('init success');

                startCanvasHeart();

            },
            slideChangeTransitionEnd: function () {
                swiperAnimate(this); //每个slide切换结束时也运行当前slide动画
            },
            slideChange: function () {
                console.log('当前index', mySwiper.activeIndex);

                let index = mySwiper.activeIndex;
                if (index === 0) {
                    startCanvasHeart();
                } else if (index === 1 && !secondFlag) {
                    secondFlag = true;

                    startLetter();
                    startLOVEWord();
                } else if (index === 2 && !thridFlag) {
                    thridFlag = true;
                    startCanvasPink();
                }
                // 每滑到一个index 即为当前index的生命周期 执行它的函数
            }
        }
    })

    function startCanvasHeart() {
        var canvas = document.getElementById("headerFluorescence");

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Initialize the GL context
        var gl = canvas.getContext('webgl');
        if (!gl) {
            console.error("Unable to initialize WebGL.");
        }

        //Time step
        var dt = 0.015;
        //Time
        var time = 0.0;

        //************** Shader sources **************

        var vertexSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
        `;

        var fragmentSource = `
        precision highp float;
        
        uniform float width;
        uniform float height;
        vec2 resolution = vec2(width, height);
        
        uniform float time;
        
        #define POINT_COUNT 8
        
        vec2 points[POINT_COUNT];
        const float speed = -0.5;
        const float len = 0.25;
        float intensity = 0.9;
        float radius = 0.015;
        
        //https://www.shadertoy.com/view/MlKcDD
        //Signed distance to a quadratic bezier
        float sdBezier(vec2 pos, vec2 A, vec2 B, vec2 C){    
            vec2 a = B - A;
            vec2 b = A - 2.0*B + C;
            vec2 c = a * 2.0;
            vec2 d = A - pos;
        
            float kk = 1.0 / dot(b,b);
            float kx = kk * dot(a,b);
            float ky = kk * (2.0*dot(a,a)+dot(d,b)) / 3.0;
            float kz = kk * dot(d,a);      
        
            float res = 0.0;
        
            float p = ky - kx*kx;
            float p3 = p*p*p;
            float q = kx*(2.0*kx*kx - 3.0*ky) + kz;
            float h = q*q + 4.0*p3;
        
            if(h >= 0.0){ 
                h = sqrt(h);
                vec2 x = (vec2(h, -h) - q) / 2.0;
                vec2 uv = sign(x)*pow(abs(x), vec2(1.0/3.0));
                float t = uv.x + uv.y - kx;
                t = clamp( t, 0.0, 1.0 );
        
                // 1 root
                vec2 qos = d + (c + b*t)*t;
                res = length(qos);
            }else{
                float z = sqrt(-p);
                float v = acos( q/(p*z*2.0) ) / 3.0;
                float m = cos(v);
                float n = sin(v)*1.732050808;
                vec3 t = vec3(m + m, -n - m, n - m) * z - kx;
                t = clamp( t, 0.0, 1.0 );
        
                // 3 roots
                vec2 qos = d + (c + b*t.x)*t.x;
                float dis = dot(qos,qos);
                
                res = dis;
        
                qos = d + (c + b*t.y)*t.y;
                dis = dot(qos,qos);
                res = min(res,dis);
                
                qos = d + (c + b*t.z)*t.z;
                dis = dot(qos,qos);
                res = min(res,dis);
        
                res = sqrt( res );
            }
            
            return res;
        }
        
        
        //http://mathworld.wolfram.com/HeartCurve.html
        vec2 getHeartPosition(float t){
            return vec2(16.0 * sin(t) * sin(t) * sin(t),
                                    -(13.0 * cos(t) - 5.0 * cos(2.0*t)
                                    - 2.0 * cos(3.0*t) - cos(4.0*t)));
        }
        
        //https://www.shadertoy.com/view/3s3GDn
        float getGlow(float dist, float radius, float intensity){
            return pow(radius/dist, intensity);
        }
        
        float getSegment(float t, vec2 pos, float offset, float scale){
            for(int i = 0; i < POINT_COUNT; i++){
                points[i] = getHeartPosition(offset + float(i)*len + fract(speed * t) * 6.28);
            }
            
            vec2 c = (points[0] + points[1]) / 2.0;
            vec2 c_prev;
            float dist = 10000.0;
            
            for(int i = 0; i < POINT_COUNT-1; i++){
                //https://tinyurl.com/y2htbwkm
                c_prev = c;
                c = (points[i] + points[i+1]) / 2.0;
                dist = min(dist, sdBezier(pos, scale * c_prev, scale * points[i], scale * c));
            }
            return max(0.0, dist);
        }
        
        void main(){
            vec2 uv = gl_FragCoord.xy/resolution.xy;
            float widthHeightRatio = resolution.x/resolution.y;
            vec2 centre = vec2(0.5, 0.5);
            vec2 pos = centre - uv;
            pos.y /= widthHeightRatio;
            //Shift upwards to centre heart
            pos.y += 0.02;
            float scale = 0.000015 * height;
            
            float t = time;
            
            //Get first segment
            float dist = getSegment(t, pos, 0.0, scale);
            float glow = getGlow(dist, radius, intensity);
            
            vec3 col = vec3(0.0);
            
            //White core
            col += 10.0*vec3(smoothstep(0.003, 0.001, dist));
            //Pink glow
            col += glow * vec3(0.94,0.14,0.4);
            
            //Get second segment
            dist = getSegment(t, pos, 3.4, scale);
            glow = getGlow(dist, radius, intensity);
            
            //White core
            col += 10.0*vec3(smoothstep(0.003, 0.001, dist));
            //Blue glow
            col += glow * vec3(0.2,0.6,1.0);
                
            //Tone mapping
            col = 1.0 - exp(-col);
        
            //Output to screen
             gl_FragColor = vec4(col,1.0);
        }
        `;

        //************** Utility functions **************

        window.addEventListener('resize', onWindowResize, false);

        function onWindowResize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform1f(widthHandle, window.innerWidth);
            gl.uniform1f(heightHandle, window.innerHeight);
        }


        //Compile shader and combine with source
        function compileShader(shaderSource, shaderType) {
            var shader = gl.createShader(shaderType);
            gl.shaderSource(shader, shaderSource);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                throw "Shader compile failed with: " + gl.getShaderInfoLog(shader);
            }
            return shader;
        }

        //From https://codepen.io/jlfwong/pen/GqmroZ
        //Utility to complain loudly if we fail to find the attribute/uniform
        function getAttribLocation(program, name) {
            var attributeLocation = gl.getAttribLocation(program, name);
            if (attributeLocation === -1) {
                throw 'Cannot find attribute ' + name + '.';
            }
            return attributeLocation;
        }

        function getUniformLocation(program, name) {
            var attributeLocation = gl.getUniformLocation(program, name);
            if (attributeLocation === -1) {
                throw 'Cannot find uniform ' + name + '.';
            }
            return attributeLocation;
        }

        //************** Create shaders **************

        //Create vertex and fragment shaders
        var vertexShader = compileShader(vertexSource, gl.VERTEX_SHADER);
        var fragmentShader = compileShader(fragmentSource, gl.FRAGMENT_SHADER);

        //Create shader programs
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        gl.useProgram(program);

        //Set up rectangle covering entire canvas 
        var vertexData = new Float32Array([
            -1.0, 1.0, 	// top left
            -1.0, -1.0, 	// bottom left
            1.0, 1.0, 	// top right
            1.0, -1.0, 	// bottom right
        ]);

        //Create vertex buffer
        var vertexDataBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

        // Layout of our data in the vertex buffer
        var positionHandle = getAttribLocation(program, 'position');

        gl.enableVertexAttribArray(positionHandle);
        gl.vertexAttribPointer(positionHandle,
            2, 				// position is a vec2 (2 values per component)
            gl.FLOAT, // each component is a float
            false, 		// don't normalize values
            2 * 4, 		// two 4 byte float components per vertex (32 bit float is 4 bytes)
            0 				// how many bytes inside the buffer to start from
        );

        //Set uniform handle
        var timeHandle = getUniformLocation(program, 'time');
        var widthHandle = getUniformLocation(program, 'width');
        var heightHandle = getUniformLocation(program, 'height');

        gl.uniform1f(widthHandle, window.innerWidth);
        gl.uniform1f(heightHandle, window.innerHeight);

        function draw() {
            //Update time
            time += dt;

            //Send uniforms to program
            gl.uniform1f(timeHandle, time);
            //Draw a triangle strip connecting vertices 0-4
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            requestAnimationFrame(draw);
        }

        draw();
    }

    function startLetter() {
        var textWrapper = document.querySelector('.ml1 .letters');
        textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

        anime.timeline({ loop: false })
            .add({
                targets: '.ml1 .letter',
                scale: [0.3, 1],
                opacity: [0, 1],
                translateZ: 0,
                easing: "easeOutExpo",
                duration: 600,
                delay: (el, i) => 70 * (i + 1)
            }).add({
                targets: '.ml1 .line',
                scaleX: [0, 1],
                opacity: [0.5, 1],
                easing: "easeOutExpo",
                duration: 700,
                offset: '-=875',
                delay: (el, i, l) => 80 * (l - i)
            });
    }

    function startLOVEWord() {
        $('.loving-word').html('');

        $('.loving-word').typeIt({
            whatToType: [
                "尤然同学：",
                "今天是我们在一起的第713天。",
                "我还是想认真的说一句：很高兴认识你。",
                "这一年我们的生活发生了很多变化。",
                "不过幸好，无论怎么变，你都还在我身旁。",
                "我特别想让你知道，你已经在我心里扎了根，谁都拔不走。",
                "当然了，就像很多情侣那样，我们会因为各种搞笑的理由吵架（我通常是被动应战）。",
                "但我希望你明白，吵着吵着就笑了的争吵只是我们生活的调味品。",
                "当你在我身边的时候，我能清晰的触摸到幸福。",
                "永远"
            ],
            typeSpeed: 100
        }, function () {
            console.log('ending')
        });
    }

    function startCanvasPink() {
        var canvas = document.getElementById("heartBackgroud"),
            ctx = canvas.getContext("2d");

        var ww, wh;

        function onResize() {
            ww = canvas.width = window.innerWidth;
            wh = canvas.height = window.innerHeight;
        }

        ctx.strokeStyle = "red";
        ctx.shadowBlur = 25;
        ctx.shadowColor = "hsla(0, 100%, 60%,0.5)";

        var precision = 100;
        var hearts = [];
        var mouseMoved = false;
        function onMove(e) {
            mouseMoved = true;
            if (e.type === "touchmove") {
                hearts.push(new Heart(e.touches[0].clientX, e.touches[0].clientY));
                hearts.push(new Heart(e.touches[0].clientX, e.touches[0].clientY));
            }
            else {
                hearts.push(new Heart(e.clientX, e.clientY));
                hearts.push(new Heart(e.clientX, e.clientY));
            }
        }

        var Heart = function (x, y) {
            this.x = x || Math.random() * ww;
            this.y = y || Math.random() * wh;
            this.size = Math.random() * 2 + 1;
            this.shadowBlur = Math.random() * 10;
            this.speedX = (Math.random() + 0.2 - 0.6) * 8;
            this.speedY = (Math.random() + 0.2 - 0.6) * 8;
            this.speedSize = Math.random() * 0.05 + 0.01;
            this.opacity = 1;
            this.vertices = [];
            for (var i = 0; i < precision; i++) {
                var step = (i / precision - 0.5) * (Math.PI * 2);
                var vector = {
                    x: (15 * Math.pow(Math.sin(step), 3)),
                    y: -(13 * Math.cos(step) - 5 * Math.cos(2 * step) - 2 * Math.cos(3 * step) - Math.cos(4 * step))
                }
                this.vertices.push(vector);
            }
        }

        Heart.prototype.draw = function () {
            this.size -= this.speedSize;
            this.x += this.speedX;
            this.y += this.speedY;
            ctx.save();
            ctx.translate(-1000, this.y);
            ctx.scale(this.size, this.size);
            ctx.beginPath();
            for (var i = 0; i < precision; i++) {
                var vector = this.vertices[i];
                ctx.lineTo(vector.x, vector.y);
            }
            ctx.globalAlpha = this.size;
            ctx.shadowBlur = Math.round((3 - this.size) * 10);
            ctx.shadowColor = "hsla(0, 100%, 60%,0.5)";
            ctx.shadowOffsetX = this.x + 1000;
            ctx.globalCompositeOperation = "screen"
            ctx.closePath();
            ctx.fill()
            ctx.restore();
        };


        function render(a) {
            requestAnimationFrame(render);

            hearts.push(new Heart())
            ctx.clearRect(0, 0, ww, wh);
            for (var i = 0; i < hearts.length; i++) {
                hearts[i].draw();
                if (hearts[i].size <= 0) {
                    hearts.splice(i, 1);
                    i--;
                }
            }
        }



        onResize();
        window.addEventListener("mousemove", onMove);
        window.addEventListener("touchmove", onMove);
        window.addEventListener("resize", onResize);
        requestAnimationFrame(render);
    }
})