// Estado global de la aplicación
let sessionData = {
    startTime: null,
    endTime: null,
    totalCost: 0,
    players: [],
    isActive: false
};

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Establecer hora actual como predeterminada solo para arrival-time
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    document.getElementById('arrival-time').value = currentTime;
});

// Iniciar nueva sesión
function startSession() {
    const startTime = document.getElementById('start-time').value;
    
    if (!startTime) {
        alert('Por favor ingresa la hora de inicio');
        return;
    }
    
    sessionData = {
        startTime: startTime,
        endTime: null,
        totalCost: 0,
        players: [],
        isActive: true
    };
    
    // Mostrar secciones de gestión
    document.getElementById('session-setup').classList.add('hidden');
    document.getElementById('initial-players').classList.remove('hidden');
    document.getElementById('active-players').classList.remove('hidden');
    
    updateProgress(2, 'Agregar jugadores iniciales');
    updatePlayersDisplay();
}

// Agregar jugadores iniciales
function addInitialPlayers() {
    const checkboxes = document.querySelectorAll('#initial-players input[type="checkbox"]:checked');
    const selectedPlayers = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedPlayers.length === 0) {
        alert('Selecciona al menos un jugador');
        return;
    }
    
    const players = selectedPlayers.filter(name => !sessionData.players.find(p => p.name === name));
    
    if (players.length === 0) {
        alert('Los jugadores seleccionados ya están en la sesión');
        return;
    }
    
    players.forEach(name => {
        const player = {
            id: Date.now() + Math.random(),
            name: name,
            arrivalTime: sessionData.startTime,
            departureTime: null,
            isActive: true,
            paid: false,
            paymentMethod: ''
        };
        sessionData.players.push(player);
    });
    
    // Limpiar selecciones
    document.querySelectorAll('#initial-players input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    // Mostrar secciones restantes
    document.getElementById('initial-players').classList.add('hidden');
    document.getElementById('player-management').classList.remove('hidden');
    document.getElementById('session-end').classList.remove('hidden');
    
    updateProgress(3, 'Gestionar sesión');
    showToast(`${players.length} jugador${players.length > 1 ? 'es' : ''} inicial${players.length > 1 ? 'es' : ''} agregado${players.length > 1 ? 's' : ''}`);
    updatePlayersDisplay();
}

// Agregar jugador
function addPlayer() {
    const name = document.getElementById('player-name').value;
    const arrivalTime = document.getElementById('arrival-time').value;
    
    if (!name || !arrivalTime) {
        alert('Por favor selecciona un jugador y la hora de llegada');
        return;
    }
    
    // Verificar que no exista el jugador
    if (sessionData.players.find(p => p.name === name)) {
        alert('Este jugador ya está en la sesión');
        return;
    }
    
    // Validar que llegada no sea antes del inicio de sesión
    if (timeToMinutes(arrivalTime) < timeToMinutes(sessionData.startTime)) {
        alert('La hora de llegada no puede ser anterior al inicio de la sesión');
        return;
    }
    
    const player = {
        id: Date.now(),
        name: name,
        arrivalTime: arrivalTime,
        departureTime: null,
        isActive: true,
        paid: false,
        paymentMethod: ''
    };
    
    sessionData.players.push(player);
    
    // Limpiar campos
    document.getElementById('player-name').value = '';
    document.getElementById('arrival-time').value = new Date().toTimeString().slice(0, 5);
    
    showToast(`${name} agregado a la sesión`);
    updatePlayersDisplay();
}

// Mostrar mensaje temporal
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Actualizar indicador de progreso
function updateProgress(step, description) {
    const stepIndicator = document.getElementById('step-indicator');
    const progressFill = document.getElementById('progress-fill');
    
    stepIndicator.textContent = `Paso ${step} de 4: ${description}`;
    progressFill.style.width = `${(step / 4) * 100}%`;
}

// Formatear números con separador de miles
function formatCurrency(amount) {
    return amount.toLocaleString('es-AR');
}

// Marcar que todos los jugadores se quedan hasta el final
function allPlayersStay() {
    let activePlayersCount = 0;
    sessionData.players.forEach(player => {
        if (player.isActive) {
            player.departureTime = null; // Asegurar que no tengan hora de salida
            activePlayersCount++;
        }
    });
    
    if (activePlayersCount > 0) {
        showToast(`${activePlayersCount} jugador${activePlayersCount > 1 ? 'es' : ''} marcado${activePlayersCount > 1 ? 's' : ''} para quedarse hasta el final`);
        updatePlayersDisplay();
    } else {
        alert('No hay jugadores activos para marcar');
    }
}



// Marcar salida de jugador
function markPlayerDeparture(playerId) {
    const currentTime = new Date().toTimeString().slice(0, 5);
    let departureTime = prompt('Hora de salida (ej: 2030, 830PM o 20:30):', currentTime.replace(':', ''));
    
    if (!departureTime) return;
    
    // Auto-formatear hora si no tiene dos puntos
    departureTime = departureTime.trim();
    if (!departureTime.includes(':') && !departureTime.toLowerCase().includes('am') && !departureTime.toLowerCase().includes('pm')) {
        // Formato HHMM -> HH:MM
        if (departureTime.length === 3) {
            departureTime = departureTime.charAt(0) + ':' + departureTime.slice(1);
        } else if (departureTime.length === 4) {
            departureTime = departureTime.slice(0, 2) + ':' + departureTime.slice(2);
        }
    }
    
    // Validar formato de hora
    try {
        const departureMinutes = timeToMinutes(departureTime);
        if (isNaN(departureMinutes) || departureMinutes < 0 || departureMinutes >= 1440) {
            throw new Error('Formato inválido');
        }
        
        const player = sessionData.players.find(p => p.id === playerId);
        if (player) {
            const arrivalMinutes = timeToMinutes(player.arrivalTime);
            
            if (departureMinutes <= arrivalMinutes) {
                alert('La hora de salida debe ser posterior a la hora de llegada');
                return;
            }
            
            // Validar que no sea después del fin de sesión (si ya está definido)
            if (sessionData.endTime) {
                const sessionEndMinutes = timeToMinutes(sessionData.endTime);
                if (departureMinutes > sessionEndMinutes) {
                    alert('La hora de salida no puede ser posterior al fin de la sesión');
                    return;
                }
            }
            
            player.departureTime = departureTime;
            player.isActive = false;
            updatePlayersDisplay();
        }
    } catch (error) {
        alert('Formato de hora inválido. Usa formato 24h (ej: 20:30) o 12h (ej: 8:30 PM)');
        return;
    }
}

// Eliminar jugador
function removePlayer(playerId) {
    if (confirm('¿Eliminar este jugador de la sesión?')) {
        sessionData.players = sessionData.players.filter(p => p.id !== playerId);
        updatePlayersDisplay();
    }
}

// Actualizar visualización de jugadores
function updatePlayersDisplay() {
    const container = document.getElementById('players-list');
    
    if (sessionData.players.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No hay jugadores en la sesión</p>';
        return;
    }
    
    container.innerHTML = sessionData.players.map((player, index) => {
        const statusClass = player.isActive ? 'status-active' : 'status-left';
        const statusText = player.isActive ? 'En juego' : `Salió: ${player.departureTime}`;
        const colorClass = `player-color-${index % 8}`;
        
        return `
            <div class="player-item ${statusClass} ${colorClass}">
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-time">Llegó: ${player.arrivalTime} | ${statusText}</div>
                </div>
                <div>
                    ${player.isActive ? 
                        `<button class="btn-small" onclick="markPlayerDeparture(${player.id})">🚪 Marcar Salida</button>` : 
                        ''
                    }
                    <button class="btn-small btn-danger" onclick="removePlayer(${player.id})">❌ Eliminar</button>
                </div>
            </div>
        `;
    }).join('');
}

// Finalizar sesión y calcular costos
function endSession() {
    const endTime = document.getElementById('end-time').value;
    const totalCost = parseFloat(document.getElementById('total-cost').value);
    
    if (!endTime || !totalCost || totalCost <= 0) {
        alert('Por favor completa la hora de fin y el costo total');
        return;
    }
    
    if (sessionData.players.length === 0) {
        alert('No hay jugadores para calcular');
        return;
    }
    
    // Advertencia inteligente
    const activePlayers = sessionData.players.filter(p => p.isActive);
    const totalPlayers = sessionData.players.length;
    
    if (activePlayers.length >= 3 && activePlayers.length === totalPlayers && totalPlayers > 4) {
        const playerNames = activePlayers.map(p => p.name).join(', ');
        const confirmed = confirm(`⚠️ ADVERTENCIA: Todos los jugadores (${activePlayers.length}) aparecen como activos hasta el final:\n\n${playerNames}\n\n¿Estás seguro de que NADIE se fue antes del final?\n\nPresiona OK para continuar o Cancelar para revisar.`);
        
        if (!confirmed) {
            return;
        }
    }
    
    sessionData.endTime = endTime;
    sessionData.totalCost = totalCost;
    sessionData.isActive = false;
    
    calculateCosts();
    showResults();
}

// Calcular costos por jugador
function calculateCosts() {
    const sessionStart = timeToMinutes(sessionData.startTime);
    const sessionEnd = timeToMinutes(sessionData.endTime);
    const totalSessionMinutes = sessionEnd - sessionStart;
    
    if (totalSessionMinutes <= 0) {
        alert('Error: La hora de fin debe ser posterior a la hora de inicio');
        return;
    }
    
    // Calcular total de minutos-jugador
    let totalPlayerMinutes = 0;
    sessionData.players.forEach(player => {
        const playerStart = timeToMinutes(player.arrivalTime);
        const playerEnd = player.departureTime ? 
            timeToMinutes(player.departureTime) : 
            sessionEnd;
        
        const playerMinutes = Math.max(0, playerEnd - playerStart);
        player.effectiveMinutes = playerMinutes;
        totalPlayerMinutes += playerMinutes;
    });
    
    // Calcular costo por jugador basado en proporción del tiempo total jugado
    sessionData.players.forEach(player => {
        const playerProportion = player.effectiveMinutes / totalPlayerMinutes;
        const playerCost = sessionData.totalCost * playerProportion;
        
        player.cost = Math.round(playerCost / 100) * 100; // Redondeo a 100
        player.proportion = playerProportion;
    });
    

}

// Convertir tiempo HH:MM o HH:MM AM/PM a minutos
function timeToMinutes(timeStr) {
    timeStr = timeStr.trim().toLowerCase();
    
    // Detectar formato AM/PM
    const isAM = timeStr.includes('am') || timeStr.includes('a.m.');
    const isPM = timeStr.includes('pm') || timeStr.includes('p.m.');
    
    // Limpiar el string de AM/PM
    let cleanTime = timeStr.replace(/\s*(am|pm|a\.m\.|p\.m\.)\s*/g, '');
    
    const [hours, minutes] = cleanTime.split(':').map(Number);
    let finalHours = hours;
    
    // Convertir formato 12h a 24h
    if (isPM && hours !== 12) {
        finalHours = hours + 12;
    } else if (isAM && hours === 12) {
        finalHours = 0;
    }
    
    return finalHours * 60 + (minutes || 0);
}

// Convertir minutos a formato HH:MM
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}



// Mostrar resultados
function showResults() {
    // Ocultar secciones de gestión
    document.getElementById('player-management').classList.add('hidden');
    document.getElementById('session-end').classList.add('hidden');
    
    // Mostrar resultados
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('total-display').textContent = `Costo Total: $${formatCurrency(sessionData.totalCost)}`;
    
    updateProgress(4, 'Resultados finales');
    
    const resultsContainer = document.getElementById('results-list');
    const totalCalculated = sessionData.players.reduce((sum, p) => sum + p.cost, 0);
    const totalPaid = sessionData.players.reduce((sum, p) => sum + (p.paid ? p.cost : 0), 0);
    const totalPending = totalCalculated - totalPaid;
    
    resultsContainer.innerHTML = `
        ${sessionData.players.map((player, index) => {
            const colorClass = `player-color-${index % 8}`;
            return `
            <div class="player-item ${colorClass}">
                <div class="player-info">
                    <div class="player-name">
                        ${player.name}
                        <span class="payment-status ${player.paid ? 'paid' : 'pending'}">
                            ${player.paid ? 'Pagado' : 'Pendiente'}
                        </span>
                    </div>
                    <div class="player-time">
                        T: ${minutesToTime(player.effectiveMinutes)}<br>
                        (${(player.proportion * 100).toFixed(1)}%)
                    </div>
                </div>
                <div class="player-cost">$${formatCurrency(player.cost)}</div>
                <button class="btn-small ${player.paid ? 'btn-danger' : 'btn-secondary'}" 
                        onclick="togglePayment(${player.id})">
                    ${player.paid ? '❌ Marcar Impago' : '✅ Marcar Pagado'}
                </button>
            </div>
        `}).join('')}
        
        <div style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span><strong>Total a Cobrar:</strong></span>
                <span style="color: #2196F3;"><strong>$${formatCurrency(sessionData.totalCost)}</strong></span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span><strong>Total Calculado:</strong></span>
                <span style="color: #333;"><strong>$${formatCurrency(totalCalculated)}</strong></span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span><strong>Total Recaudado:</strong></span>
                <span style="color: #4CAF50;"><strong>$${formatCurrency(totalPaid)}</strong></span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span><strong>Saldo:</strong></span>
                <span style="color: ${totalCalculated - sessionData.totalCost >= 0 ? '#4CAF50' : '#f44336'};"><strong>${totalCalculated - sessionData.totalCost >= 0 ? '+' : ''}$${formatCurrency(Math.abs(totalCalculated - sessionData.totalCost))}</strong></span>
            </div>
        </div>
    `;
}

// Alternar estado de pago
function togglePayment(playerId) {
    const player = sessionData.players.find(p => p.id === playerId);
    if (player) {
        player.paid = !player.paid;
        showResults();
    }
}

// Compartir resultados por WhatsApp
function shareResults() {
    const today = new Date().toLocaleDateString('es-ES');
    const totalCalculated = sessionData.players.reduce((sum, p) => sum + p.cost, 0);
    const totalPaid = sessionData.players.reduce((sum, p) => sum + (p.paid ? p.cost : 0), 0);
    const saldo = totalCalculated - sessionData.totalCost;
    
    let message = `🎾 RESULTADOS PÁDEL - ${today}\n\n`;
    message += `💰 Costo total: $${formatCurrency(sessionData.totalCost)}\n`;
    message += `⏰ Sesión: ${sessionData.startTime} - ${sessionData.endTime}\n\n`;
    message += `👥 PAGOS POR JUGADOR:\n`;
    
    sessionData.players.forEach(player => {
        const status = player.paid ? '✅ Pagado' : '⏳ Pendiente';
        const hours = (player.effectiveMinutes / 60).toFixed(1);
        message += `• ${player.name}: $${formatCurrency(player.cost)} (${hours}h) ${status}\n`;
    });
    
    message += `\n📄 RESUMEN:\n`;
    message += `Recaudado: $${formatCurrency(totalPaid)}\n`;
    message += `Pendiente: $${formatCurrency(totalCalculated - totalPaid)}\n`;
    message += `Saldo: ${saldo >= 0 ? '+' : ''}$${formatCurrency(Math.abs(saldo))}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Reiniciar aplicación
function resetApp() {
    if (confirm('¿Iniciar una nueva sesión? Se perderán los datos actuales.')) {
        sessionData = {
            startTime: null,
            endTime: null,
            totalCost: 0,
            players: [],
            isActive: false
        };
        
        // Resetear formularios
        document.getElementById('start-time').value = '';
        document.getElementById('total-cost').value = '';
        document.getElementById('player-name').value = '';
        document.getElementById('arrival-time').value = new Date().toTimeString().slice(0, 5);
        document.getElementById('end-time').value = '';
        
        // Mostrar solo la sección inicial
        document.getElementById('session-setup').classList.remove('hidden');
        document.getElementById('initial-players').classList.add('hidden');
        document.getElementById('player-management').classList.add('hidden');
        document.getElementById('active-players').classList.add('hidden');
        document.getElementById('session-end').classList.add('hidden');
        document.getElementById('results').classList.add('hidden');
        
        updateProgress(1, 'Configurar sesión');
        
        // Limpiar selecciones iniciales
        document.querySelectorAll('#initial-players input[type="checkbox"]').forEach(cb => cb.checked = false);
    }
}