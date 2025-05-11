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
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        drawConnections() {
            this.connections.forEach(node => {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(node.x, node.y);
                ctx.strokeStyle = 'rgba(188, 158, 255, 0.15)';
                ctx.lineWidth = 0.5;
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
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(188, 158, 255, 0.8)';
                ctx.fill();
            });
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
    
    initNodes();
    drawCircuitPattern();
});