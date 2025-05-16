document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('circuitCanvas');
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const circuitNodes = [];
    const numNodes = Math.min(Math.floor(width * height / 20000), 50);
    const connectionDistance = Math.min(width, height) / 4;
    
    const colors = ['#bc9eff', '#8a6aff', '#6d4dff', '#5d3dff'];
    let gpuMode = false;
    let gpuModeActive = false;
    let gpuParticles = [];
    
    class Node {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 3 + 1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.connections = [];
            this.pulses = [];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > width) {
                this.vx *= -1;
            }
            
            if (this.y < 0 || this.y > height) {
                this.vy *= -1;
            }
            
            this.pulses = this.pulses.filter(pulse => {
                pulse.progress += 0.02;
                return pulse.progress <= 1;
            });
            
            if (Math.random() < 0.002) {
                const target = this.connections[Math.floor(Math.random() * this.connections.length)];
                if (target) {
                    this.pulses.push({
                        targetNode: target,
                        progress: 0
                    });
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = gpuMode ? this.gpuColor || this.color : this.color;
            ctx.fill();
        }

        drawConnections() {
            this.connections.forEach(node => {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(node.x, node.y);
                ctx.strokeStyle = gpuMode ? 'rgba(76, 217, 100, 0.2)' : 'rgba(188, 158, 255, 0.15)';
                ctx.lineWidth = gpuMode ? 1 : 0.5;
                ctx.stroke();
            });
        }

        drawPulses() {
            this.pulses.forEach(pulse => {
                const target = pulse.targetNode;
                const progress = pulse.progress;
                const x = this.x + (target.x - this.x) * progress;
                const y = this.y + (target.y - this.y) * progress;
                
                ctx.beginPath();
                ctx.arc(x, y, gpuMode ? 3 : 2, 0, Math.PI * 2);
                ctx.fillStyle = gpuMode ? 'rgba(76, 217, 100, 0.8)' : 'rgba(188, 158, 255, 0.8)';
                ctx.fill();
            });
        }
    }
    
    class GPUParticle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 4 + 1;
            this.speedX = (Math.random() - 0.5) * 3;
            this.speedY = (Math.random() - 0.5) * 3;
            this.life = 100 + Math.random() * 100;
            this.opacity = Math.random() * 0.7 + 0.3;
            this.color = `rgba(76, 217, 100, ${this.opacity})`;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= 1;
            this.opacity -= 0.005;
            if (this.opacity < 0) this.opacity = 0;
            this.color = `rgba(76, 217, 100, ${this.opacity})`;
        }
        
        draw() {
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.size, this.size);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function initNodes() {
        for (let i = 0; i < numNodes; i++) {
            circuitNodes.push(new Node());
        }
        
        circuitNodes.forEach(node => {
            circuitNodes.forEach(otherNode => {
                if (node !== otherNode) {
                    const dx = node.x - otherNode.x;
                    const dy = node.y - otherNode.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < connectionDistance && Math.random() < 0.3) {
                        node.connections.push(otherNode);
                    }
                }
            });
        });
    }
    
    function toggleGPUMode() {
        gpuMode = !gpuMode;
        
        if (gpuMode) {
            document.body.style.background = 'linear-gradient(135deg, #0a2613 0%, #134a1e 100%)';
            document.querySelector('.container').style.background = 'rgba(10, 38, 19, 0.5)';
            showGPUStartupAnimation();
            
        } else {
            document.body.style.background = 'linear-gradient(135deg, #1e1033 0%, #301b5e 100%)';
            document.querySelector('.container').style.background = 'rgba(20, 10, 40, 0.5)';
            gpuParticles = [];
        }
    }
    
    function showGPUStartupAnimation() {
        gpuModeActive = true;
        
        const gpuStartupText = "FAN NOISE INTENSIFIES";
        const containerRect = document.querySelector('.container').getBoundingClientRect();
        
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.background = 'rgba(0, 0, 0, 0.7)';
        overlay.style.zIndex = '100';
        overlay.style.color = '#4CD964';
        overlay.style.fontFamily = 'monospace';
        overlay.style.fontSize = '2rem';
        overlay.style.fontWeight = 'bold';
        overlay.style.textShadow = '0 0 10px rgba(76, 217, 100, 0.7)';
        
        document.body.appendChild(overlay);
        
        let charIndex = 0;
        const startupInterval = setInterval(() => {
            overlay.textContent = gpuStartupText.substring(0, charIndex);
            charIndex++;
            
            if (charIndex > gpuStartupText.length) {
                clearInterval(startupInterval);
                
                setTimeout(() => {
                    document.body.removeChild(overlay);
                    
                    for (let i = 0; i < 100; i++) {
                        setTimeout(() => {
                            for (let j = 0; j < 5; j++) {
                                gpuParticles.push(new GPUParticle());
                            }
                        }, i * 20);
                    }
                }, 500);
            }
        }, 50);
    }

    function drawCircuitPattern() {
        ctx.clearRect(0, 0, width, height);
        
        circuitNodes.forEach(node => {
            node.update();
            node.drawConnections();
        });
        
        circuitNodes.forEach(node => {
            node.draw();
            node.drawPulses();
        });
        
        if (gpuMode) {
            gpuParticles = gpuParticles.filter(particle => particle.life > 0);
            gpuParticles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            if (gpuModeActive && Math.random() < 0.1) {
                for (let i = 0; i < 3; i++) {
                    gpuParticles.push(new GPUParticle());
                }
            }
        }
        
        requestAnimationFrame(drawCircuitPattern);
    }

    function handleResize() {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = window.devicePixelRatio || 1;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        circuitNodes.length = 0;
        initNodes();
    }

    let shiftPressed = false;
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Shift') {
            shiftPressed = true;
        } else if (e.key.toLowerCase() === 'g' && shiftPressed) {
            toggleGPUMode();
        }
    });
    
    document.addEventListener('keyup', function(e) {
        if (e.key === 'Shift') {
            shiftPressed = false;
        }
    });
    
    document.querySelector('.profile-image-container').addEventListener('dblclick', function() {
        toggleGPUMode();
    });

    window.addEventListener('resize', handleResize);
    
    initNodes();
    drawCircuitPattern();
});
