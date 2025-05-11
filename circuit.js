class CircuitAnimation {
  constructor() {
    this.canvas = document.getElementById('circuitCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    this.circuitNodes = [];
    this.numNodes = Math.min(Math.floor(this.width * this.height / 20000), 50);
    this.connectionDistance = Math.min(this.width, this.height) / 4;
    this.colors = ['#bc9eff', '#8a6aff', '#6d4dff', '#5d3dff'];
    
    this.initNodes();
    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);
    
    window.addEventListener('resize', this.handleResize);
    this.animate();
  }
  
  createNode() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 3 + 1,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      connections: [],
      pulses: [],
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
        if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
        
        this.pulses = this.pulses.filter(pulse => {
          pulse.progress += 0.02;
          return pulse.progress <= 1;
        });
        
        if (Math.random() < 0.002 && this.connections.length > 0) {
          const target = this.connections[Math.floor(Math.random() * this.connections.length)];
          if (target) {
            this.pulses.push({
              targetNode: target,
              progress: 0
            });
          }
        }
      },
      
      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      },
      
      drawConnections(ctx) {
        this.connections.forEach(node => {
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(node.x, node.y);
          ctx.strokeStyle = 'rgba(188, 158, 255, 0.15)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        });
      },
      
      drawPulses(ctx) {
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
    };
  }
  
  initNodes() {
    this.circuitNodes = [];
    
    for (let i = 0; i < this.numNodes; i++) {
      this.circuitNodes.push(this.createNode());
    }
    
    this.circuitNodes.forEach(node => {
      this.circuitNodes.forEach(otherNode => {
        if (node !== otherNode) {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < this.connectionDistance && Math.random() < 0.3) {
            node.connections.push(otherNode);
          }
        }
      });
    });
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    this.circuitNodes.forEach(node => {
      node.update();
      node.drawConnections(this.ctx);
    });
    
    this.circuitNodes.forEach(node => {
      node.draw(this.ctx);
      node.drawPulses(this.ctx);
    });
    
    requestAnimationFrame(this.animate);
  }
  
  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    this.initNodes();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CircuitAnimation();
});