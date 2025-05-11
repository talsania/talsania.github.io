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
    let connectionDistance = Math.min(width, height) / 4;
    
    const colors = ['#bc9eff', '#8a6aff', '#6d4dff', '#5d3dff'];
    
    let turboMode = false;
    let turboIntensity = 0;
    const maxTurboIntensity = 1;
    const turboIncrement = 0.05;
    const turboDecrement = 0.02;
    
    class Node {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.baseVx = this.vx;
            this.baseVy = this.vy;
            this.radius = Math.random() * 3 + 1;
            this.baseRadius = this.radius;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.connections = [];
            this.pulses = [];
            this.initialX = this.x;
            this.initialY = this.y;
            this.vibrationPhaseX = Math.random() * Math.PI * 2;
            this.vibrationPhaseY = Math.random() * Math.PI * 2;
            this.vibrationSpeed = 0.1 + Math.random() * 0.2;
        }

        update() {
            const turboFactor = 1 + (turboIntensity * 3);
            this.vx = this.baseVx * turboFactor;
            this.vy = this.baseVy * turboFactor;
            
            this.x += this.vx;
            this.y += this.vy;
            
            if (turboIntensity > 0) {
                const vibrationAmount = turboIntensity * 3;
                this.x += Math.sin(Date.now() * this.vibrationSpeed * 0.01 + this.vibrationPhaseX) * vibrationAmount;
                this.y += Math.cos(Date.now() * this.vibrationSpeed * 0.01 + this.vibrationPhaseY) * vibrationAmount;
                this.radius = this.baseRadius * (1 + turboIntensity * 0.5);
            }
            
            if (this.x < 0 || this.x > width) {
                this.vx *= -1;
                this.baseVx *= -1;
            }
            
            if (this.y < 0 || this.y > height) {
                this.vy *= -1;
                this.baseVy *= -1;
            }
            
            const pulseSpeed = 0.02 * (1 + turboIntensity * 2);
            this.pulses = this.pulses.filter(pulse => {
                pulse.progress += pulseSpeed;
                return pulse.progress <= 1;
            });
            
            const pulseChance = 0.002 * (1 + turboIntensity * 5);
            if (Math.random() < pulseChance && this.connections.length > 0) {
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
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        drawConnections() {
            const opacity = 0.15 + turboIntensity * 0.15;
            const lineWidth = 0.5 + turboIntensity * 0.5;
            
            this.connections.forEach(node => {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(node.x, node.y);
                ctx.strokeStyle = `rgba(188, 158, 255, ${opacity})`;
                ctx.lineWidth = lineWidth;
                ctx.stroke();
            });
        }

        drawPulses() {
            this.pulses.forEach(pulse => {
                const target = pulse.targetNode;
                const progress = pulse.progress;
                const x = this.x + (target.x - this.x) * progress;
                const y = this.y + (target.y - this.y) * progress;
                
                const pulseSize = 2 + turboIntensity * 2;
                const glowIntensity = 0.8 + turboIntensity * 0.2;
                
                if (turboIntensity > 0.3) {
                    ctx.beginPath();
                    ctx.arc(x, y, pulseSize * 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(188, 158, 255, ${0.2 * turboIntensity})`;
                    ctx.fill();
                }
                
                ctx.beginPath();
                ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(188, 158, 255, ${glowIntensity})`;
                ctx.fill();
            });
        }
    }

    function initNodes() {
        for (let i = 0; i < numNodes; i++) {
            circuitNodes.push(new Node());
        }
        
        updateConnections();
    }
    
    function updateConnections() {
        circuitNodes.forEach(node => {
            node.connections = [];
        });
        
        const currentConnectionDistance = connectionDistance * (1 + turboIntensity * 0.5);
        
        circuitNodes.forEach(node => {
            circuitNodes.forEach(otherNode => {
                if (node !== otherNode) {
                    const dx = node.x - otherNode.x;
                    const dy = node.y - otherNode.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    const connectionProbability = 0.3 * (1 + turboIntensity * 0.7);
                    if (distance < currentConnectionDistance && Math.random() < connectionProbability) {
                        node.connections.push(otherNode);
                    }
                }
            });
        });
    }

    function drawCircuitPattern() {
        ctx.clearRect(0, 0, width, height);
        
        if (turboMode && turboIntensity < maxTurboIntensity) {
            turboIntensity += turboIncrement;
            if (turboIntensity > maxTurboIntensity) {
                turboIntensity = maxTurboIntensity;
            }
            
            if (Math.random() < 0.1) {
                updateConnections();
            }
        } else if (!turboMode && turboIntensity > 0) {
            turboIntensity -= turboDecrement;
            if (turboIntensity < 0) {
                turboIntensity = 0;
                updateConnections();
            }
        }
        
        circuitNodes.forEach(node => {
            node.update();
            node.drawConnections();
        });
        
        circuitNodes.forEach(node => {
            node.draw();
            node.drawPulses();
        });
        
        if (turboIntensity > 0) {
            const blurAmount = turboIntensity * 20;
            document.body.style.filter = `blur(${blurAmount * 0.15}px)`;
            document.querySelector('.container').style.filter = `blur(${blurAmount * 0.05}px)`;
            
            const glowAmount = Math.floor(turboIntensity * 15);
            const containerElement = document.querySelector('.container');
            containerElement.style.boxShadow = `0 8px 32px rgba(0, 0, 0, 0.3), 
                                               inset 0 2px 3px rgba(255, 255, 255, 0.05), 
                                               0 0 ${glowAmount}px rgba(188, 158, 255, ${turboIntensity * 0.5})`;
        } else {
            document.body.style.filter = '';
            document.querySelector('.container').style.filter = '';
            document.querySelector('.container').style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 2px 3px rgba(255, 255, 255, 0.05)';
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

    window.addEventListener('resize', handleResize);
    
    const profileImage = document.querySelector('.profile-image-container');
    let clickCount = 0;
    let clickTimer;
    
    profileImage.addEventListener('click', () => {
        clickCount++;
        
        if (clickCount === 1) {
            turboMode = !turboMode;
            
            if (turboMode) {
                profileImage.style.transform = 'scale(1.2) rotate(5deg)';
                setTimeout(() => {
                    profileImage.style.transform = 'scale(1.05)';
                }, 300);
            } else {
                profileImage.style.transform = 'scale(0.9) rotate(-5deg)';
                setTimeout(() => {
                    profileImage.style.transform = '';
                }, 300);
            }
        }
        
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, 500);
    });
    
    profileImage.addEventListener('mouseover', () => {
        if (turboMode) {
            profileImage.style.transform = 'scale(1.1)';
        }
    });
    
    profileImage.addEventListener('mouseout', () => {
        if (turboMode) {
            profileImage.style.transform = 'scale(1.05)';
        } else {
            profileImage.style.transform = '';
        }
    });
    
    initNodes();
    drawCircuitPattern();
});
