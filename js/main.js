let teams = [];
let groups = { A: [], B: [] };
let groupStandings = { A: {}, B: {} };
let groupMatches = { A: [], B: [] };
let knockoutMatches = [];
let currentStage = 'team-entry';

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('submit-teams').addEventListener('click', submitTeams);

    document.getElementById('draw-groups').addEventListener('click', drawGroups);

    document.getElementById('scroll-to-top').addEventListener('click', scrollToTop);

    document.getElementById('restart-tournament').addEventListener('click', restartTournament);

    window.addEventListener('scroll', toggleScrollButton);
});

function submitTeams() {
    const inputs = document.querySelectorAll('.team-name');
    teams = Array.from(inputs).map(input => input.value.trim()).filter(name => name !== '');

    if (teams.length !== 6) {
        alert('لطفاً نام دقیقاً 6 تیم را وارد کنید');
        return;
    }
    document.getElementById('group-stage').classList.remove('hidden');
    document.getElementById('draw-groups').classList.remove('hidden');

    document.getElementById('team-entry').classList.add('animate__fadeOut');
    setTimeout(() => {
        document.getElementById('team-entry').classList.add('hidden');
    }, 500);

    updateProgress();
}

function drawGroups() {
    const shuffled = [...teams].sort(() => 0.5 - Math.random());
    groups.A = shuffled.slice(0, 3);
    groups.B = shuffled.slice(3, 6);

    initializeStandings();

    displayGroups();

    generateGroupMatches();

    displayGroupMatches();

    document.getElementById('draw-groups').classList.add('hidden');
    document.getElementById('group-matches').classList.remove('hidden');

    document.getElementById('group-tables').classList.add('animate__fadeIn');
}

function initializeStandings() {
    for (const groupName in groups) {
        groupStandings[groupName] = {};
        groups[groupName].forEach(team => {
            groupStandings[groupName][team] = {
                points: 0,
                goalDifference: 0,
                goalsFor: 0,
                goalsAgainst: 0
            };
        });
    }
}

function displayGroups() {
    const groupTablesDiv = document.getElementById('group-tables');
    groupTablesDiv.innerHTML = '';

    for (const groupName in groups) {
        const groupDiv = document.createElement('div');
        groupDiv.innerHTML = `
                <h3 style="display: flex; align-items: center;">
                    گروه ${groupName}
                    <span class="group-badge group-${groupName}">${groups[groupName].length} تیم</span>
                </h3>
            `;

        const table = document.createElement('table');
        table.innerHTML = `
                <thead>
                    <tr>
                        <th>رتبه</th>
                        <th>تیم</th>
                        <th>امتیاز</th>
                        <th>تفاضل گل</th>
                        <th>گل زده</th>
                        <th>گل خورده</th>
                    </tr>
                </thead>
                <tbody id="group-${groupName}-tbody">
                    ${groups[groupName].map((team, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>
                                <div style="display: flex; align-items: center; justify-content: center;">
                                    ${team}
                                    <div class="team-logo">${team.charAt(0)}</div>
                                </div>
                            </td>
                            <td>0</td>
                            <td>0</td>
                            <td>0</td>
                            <td>0</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;

        groupDiv.appendChild(table);
        groupTablesDiv.appendChild(groupDiv);
    }
}

function generateGroupMatches() {
    for (const groupName in groups) {
        const groupTeams = groups[groupName];
        groupMatches[groupName] = [];

        for (let i = 0; i < groupTeams.length; i++) {
            for (let j = i + 1; j < groupTeams.length; j++) {
                groupMatches[groupName].push({
                    team1: groupTeams[i],
                    team2: groupTeams[j],
                    score1: 0,
                    score2: 0,
                    duelWinner: null,
                    completed: false
                });
            }
        }
    }
}

function displayGroupMatches() {
    const matchesContainer = document.getElementById('matches-container');
    matchesContainer.innerHTML = '';

    for (const groupName in groupMatches) {
        const matches = groupMatches[groupName];
        const groupDiv = document.createElement('div');
        groupDiv.innerHTML = `
                <h3 style="color: var(--primary); display: flex; align-items: center;">
                    <i class="fas fa-users" style="margin-left: 10px;"></i>
                    بازی‌های گروه ${groupName}
                </h3>
            `;

        matches.forEach((match, index) => {
            const matchCard = document.createElement('div');
            matchCard.className = 'match-card';
            matchCard.innerHTML = `
                    <div class="match-teams">
                        <span>${match.team1}</span>
                        <span class="match-vs">vs</span>
                        <span>${match.team2}</span>
                    </div>
                    
                    ${match.completed ? `
                        <div class="match-result">
                            <span>نتیجه: ${match.score1} - ${match.score2}</span>
                        </div>
                        ${match.duelWinner ? `
                            <div class="duel-badge">
                                <i class="fas fa-fist-raised"></i> برنده دوئل: ${match.duelWinner}
                            </div>
                        ` : ''}
                        <div class="winner-badge">
                            <i class="fas fa-trophy"></i> برنده: ${match.score1 > match.score2 ? match.team1 : match.team2}
                        </div>
                    ` : `
                        <div class="match-result">
                            <input type="number" class="score-input" id="${groupName}-${index}-score1" 
                                   placeholder="امتیاز" min="0" max="20">
                            <span> - </span>
                            <input type="number" class="score-input" id="${groupName}-${index}-score2" 
                                   placeholder="امتیاز" min="0" max="20">
                        </div>
                        <button onclick="submitGroupMatch('${groupName}', ${index})" 
                                class="btn-primary" style="margin-top: 10px;">
                            <i class="fas fa-check-circle"></i> ثبت نتیجه
                        </button>
                    `}
                `;

            groupDiv.appendChild(matchCard);
        });

        matchesContainer.appendChild(groupDiv);
    }
}

window.submitGroupMatch = function (groupName, matchIndex) {
    const match = groupMatches[groupName][matchIndex];
    const score1Input = document.getElementById(`${groupName}-${matchIndex}-score1`);
    const score2Input = document.getElementById(`${groupName}-${matchIndex}-score2`);

    const score1 = parseInt(score1Input.value);
    const score2 = parseInt(score2Input.value);

    if (isNaN(score1) || isNaN(score2)) {
        alert('لطفاً برای هر دو تیم امتیاز وارد کنید');
        return;
    }

    if (score1 > 9 || score2 > 9) {
        alert('امتیاز هر تیم در مرحله گروهی نمی‌تواند بیشتر از 9 باشد');
        return;
    }

    if (score1 === score2) {
        alert('بازی نمی‌تواند مساوی باشد!');
        return;
    }

    const validScores = [5, 6, 9];
    const team1Valid = validScores.includes(score1);
    const team2Valid = validScores.includes(score2);

    if (!team1Valid && !team2Valid) {
        alert('برای حداقل یکی از تیم‌ها باید یکی از اعداد 5، 6 یا 9 را وارد کنید');
        return;
    }

    match.score1 = score1;
    match.score2 = score2;

    if (score1 === 9 || score2 === 9) {
        match.completed = true;
        updateStandings(groupName, match, false);
        displayGroupMatches();
        updateGroupTables();
        checkGroupStageCompletion();
    } else {
        const duelWinner = prompt(`لطفاً برنده دوئل بین ${match.team1} و ${match.team2} را انتخاب کنید (1 یا 2):\n1. ${match.team1}\n2. ${match.team2}`);

        if (duelWinner === '1') {
            match.duelWinner = match.team1;
        } else if (duelWinner === '2') {
            match.duelWinner = match.team2;
        } else {
            alert('انتخاب نامعتبر! لطفاً 1 یا 2 را وارد کنید.');
            return;
        }

        match.completed = true;
        updateStandings(groupName, match, true);
        displayGroupMatches();
        updateGroupTables();
        checkGroupStageCompletion();
    }

    const matchCard = score1Input.closest('.match-card');
    matchCard.classList.add('animate__pulse');
    setTimeout(() => {
        matchCard.classList.remove('animate__pulse');
    }, 1000);
};

function updateStandings(groupName, match, isDuelWin = false) {
    const standings = groupStandings[groupName];

    if (isDuelWin) {
        standings[match.duelWinner].points += 1;
    } else {
        if (match.score1 > match.score2) {
            standings[match.team1].points += 2;
        } else {
            standings[match.team2].points += 2;
        }
    }

    standings[match.team1].goalDifference += (match.score1 - match.score2);
    standings[match.team2].goalDifference += (match.score2 - match.score1);

    standings[match.team1].goalsFor += match.score1;
    standings[match.team1].goalsAgainst += match.score2;
    standings[match.team2].goalsFor += match.score2;
    standings[match.team2].goalsAgainst += match.score1;
}

function updateGroupTables() {
    for (const groupName in groupStandings) {
        const standings = groupStandings[groupName];
        const tbody = document.getElementById(`group-${groupName}-tbody`);

        const sortedTeams = Object.entries(standings)
            .sort((a, b) => {
                if (b[1].points !== a[1].points) {
                    return b[1].points - a[1].points;
                }
                return b[1].goalDifference - a[1].goalDifference;
            });

        tbody.innerHTML = sortedTeams.map(([team, stats], index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <div style="display: flex; align-items: center; justify-content: center;">
                            ${team}
                            <div class="team-logo">${team.charAt(0)}</div>
                        </div>
                    </td>
                    <td>${stats.points}</td>
                    <td>${stats.goalDifference}</td>
                    <td>${stats.goalsFor}</td>
                    <td>${stats.goalsAgainst}</td>
                </tr>
            `).join('');

        groups[groupName] = sortedTeams.map(entry => entry[0]);
    }

    updateProgress();
}

function checkGroupStageCompletion() {
    let allCompleted = true;

    for (const groupName in groupMatches) {
        for (const match of groupMatches[groupName]) {
            if (!match.completed) {
                allCompleted = false;
                break;
            }
        }
        if (!allCompleted) break;
    }

    if (allCompleted) {
        currentStage = 'knockout';

        document.getElementById('knockout-stage').classList.remove('hidden');
        document.getElementById('knockout-stage').classList.add('animate__fadeIn');

        document.getElementById('group-matches').classList.add('animate__fadeOut');
        setTimeout(() => {
            document.getElementById('group-matches').classList.add('hidden');
        }, 500);

        generateKnockoutMatches();

        setTimeout(() => {
            document.getElementById('knockout-stage').scrollIntoView({ behavior: 'smooth' });
        }, 700);
    }
}
function generateKnockoutMatches() {
    knockoutMatches = [
        {
            type: 'semifinal',
            match: `${groups.A[0]} (A1) vs ${groups.B[1]} (B2)`,
            team1: groups.A[0],
            team2: groups.B[1],
            leg1: { score1: 0, score2: 0, completed: false },
            leg2: { score1: 0, score2: 0, completed: false },
            duelWinner: null,
            winner: null,
            completed: false
        },
        {
            type: 'semifinal',
            match: `${groups.B[0]} (B1) vs ${groups.A[1]} (A2)`,
            team1: groups.B[0],
            team2: groups.A[1],
            leg1: { score1: 0, score2: 0, completed: false },
            leg2: { score1: 0, score2: 0, completed: false },
            duelWinner: null,
            winner: null,
            completed: false
        }
    ];

    displayKnockoutMatches();

    updateProgress();
}

function displayKnockoutMatches() {
    const semifinalDiv = document.getElementById('semifinal-matches');
    semifinalDiv.innerHTML = `
            <h3 style="color: var(--accent);">
                <i class="fas fa-flag-checkered" style="margin-left: 10px;"></i>
                مرحله نیمه نهایی
            </h3>
            <p>برنده باید در مجموع دو بازی به امتیاز 11 برسد</p>
        `;

    knockoutMatches.forEach((match, index) => {
        if (match.type === 'semifinal') {
            const matchCard = document.createElement('div');
            matchCard.className = 'match-card';

            if (match.completed) {
                matchCard.innerHTML = `
                        <div class="match-teams">
                            <span>${match.team1}</span>
                            <span class="match-vs">vs</span>
                            <span>${match.team2}</span>
                        </div>
                        
                        <div style="margin-top: 15px;">
                            <p><strong>بازی رفت:</strong> ${match.leg1.score1} - ${match.leg1.score2}</p>
                            <p><strong>بازی برگشت:</strong> ${match.leg2.score1} - ${match.leg2.score2}</p>
                            <p><strong>جمع دو بازی:</strong> ${match.leg1.score1 + match.leg2.score1} - ${match.leg1.score2 + match.leg2.score2}</p>
                            ${match.duelWinner ? `
                                <div class="duel-badge">
                                    <i class="fas fa-fist-raised"></i> برنده دوئل: ${match.duelWinner}
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="winner-badge" style="margin-top: 10px;">
                            <i class="fas fa-trophy"></i> برنده: ${match.winner}
                        </div>
                    `;
            } else {
                matchCard.innerHTML = `
                        <div class="match-teams">
                            <span>${match.team1}</span>
                            <span class="match-vs">vs</span>
                            <span>${match.team2}</span>
                        </div>
                        
                        <div style="margin-top: 20px;">
                            <h4 style="color: var(--info);">
                                <i class="fas fa-arrow-right" style="margin-left: 5px;"></i>
                                بازی رفت
                            </h4>
                            ${match.leg1.completed ? `
                                <p>نتیجه: ${match.leg1.score1} - ${match.leg1.score2}</p>
                            ` : `
                                <div class="match-result">
                                    <input type="number" class="score-input" id="sf${index}-leg1-score1" 
                                           placeholder="امتیاز" min="0" max="20">
                                    <span> - </span>
                                    <input type="number" class="score-input" id="sf${index}-leg1-score2" 
                                           placeholder="امتیاز" min="0" max="20">
                                </div>
                                <button onclick="submitKnockoutMatch(${index}, 'leg1')" 
                                        class="btn-primary" style="margin-top: 10px;">
                                    <i class="fas fa-check-circle"></i> ثبت نتیجه رفت
                                </button>
                            `}
                        </div>
                        
                        <div style="margin-top: 25px;">
                            <h4 style="color: var(--info);">
                                <i class="fas fa-arrow-left" style="margin-left: 5px;"></i>
                                بازی برگشت
                            </h4>
                            ${match.leg2.completed ? `
                                <p>نتیجه: ${match.leg2.score1} - ${match.leg2.score2}</p>
                            ` : `
                                <div class="match-result">
                                    <input type="number" class="score-input" id="sf${index}-leg2-score1" 
                                           placeholder="امتیاز" min="0" max="20">
                                    <span> - </span>
                                    <input type="number" class="score-input" id="sf${index}-leg2-score2" 
                                           placeholder="امتیاز" min="0" max="20">
                                </div>
                                <button onclick="submitKnockoutMatch(${index}, 'leg2')" 
                                        class="btn-primary" style="margin-top: 10px;">
                                    <i class="fas fa-check-circle"></i> ثبت نتیجه برگشت
                                </button>
                            `}
                        </div>
                    `;
            }

            semifinalDiv.appendChild(matchCard);
        }
    });

    const allSemifinalsCompleted = knockoutMatches.every(m => m.completed);
    if (allSemifinalsCompleted) {
        generateFinalMatch();
    }
}

window.submitKnockoutMatch = function (matchIndex, leg) {
    const match = knockoutMatches[matchIndex];
    const score1Input = document.getElementById(`sf${matchIndex}-${leg}-score1`);
    const score2Input = document.getElementById(`sf${matchIndex}-${leg}-score2`);

    const score1 = parseInt(score1Input.value);
    const score2 = parseInt(score2Input.value);

    if (isNaN(score1) || isNaN(score2)) {
        alert('لطفاً برای هر دو تیم امتیاز وارد کنید');
        return;
    }

    if (score1 > 11 || score2 > 11) {
        alert('امتیاز هر تیم در مرحله نیمه نهایی نمی‌تواند بیشتر از 11 باشد');
        return;
    }

    match[leg].score1 = score1;
    match[leg].score2 = score2;
    match[leg].completed = true;

    if (match.leg1.completed && match.leg2.completed) {
        let team1Wins = 0;
        let team2Wins = 0;

        if (match.leg1.score1 > match.leg1.score2) team1Wins++;
        else if (match.leg1.score1 < match.leg1.score2) team2Wins++;

        if (match.leg2.score1 > match.leg2.score2) team1Wins++;
        else if (match.leg2.score1 < match.leg2.score2) team2Wins++;

        if (team1Wins > team2Wins) {
            match.winner = match.team1;
        } else if (team2Wins > team1Wins) {
            match.winner = match.team2;
        } else {
            const duelWinner = prompt(`تعداد بردها مساوی است! لطفاً برنده دوئل نهایی را انتخاب کنید (1 یا 2):\n1. ${match.team1}\n2. ${match.team2}`);

            if (duelWinner === '1') {
                match.winner = match.team1;
                match.duelWinner = match.team1;
            } else if (duelWinner === '2') {
                match.winner = match.team2;
                match.duelWinner = match.team2;
            } else {
                alert('انتخاب نامعتبر! لطفاً 1 یا 2 را وارد کنید.');
                match[leg].completed = false;
                return;
            }
        }

        match.completed = true;
    }

    displayKnockoutMatches();

    const allSemifinalsCompleted = knockoutMatches.filter(m => m.type === 'semifinal').every(m => m.completed);
    if (allSemifinalsCompleted) {
        generateFinalMatch();
    }
};

function displayKnockoutMatches() {
    const semifinalDiv = document.getElementById('semifinal-matches');
    semifinalDiv.innerHTML = `
      <h3 style="color: var(--accent);">
          <i class="fas fa-flag-checkered" style="margin-left: 10px;"></i>
          مرحله نیمه نهایی
      </h3>
      <p>هر تیم باید در حداقل یک بازی به 11 امتیاز برسد</p>
  `;

    knockoutMatches.forEach((match, index) => {
        if (match.type === 'semifinal') {
            const matchCard = document.createElement('div');
            matchCard.className = 'match-card';

            if (match.completed) {
                matchCard.innerHTML = `
                  <div class="match-teams">
                      <span>${match.team1}</span>
                      <span class="match-vs">vs</span>
                      <span>${match.team2}</span>
                  </div>
                  
                  <div style="margin-top: 15px;">
                      <p><strong>بازی رفت:</strong> ${match.leg1.score1} - ${match.leg1.score2}</p>
                      <p><strong>بازی برگشت:</strong> ${match.leg2.score1} - ${match.leg2.score2}</p>
                      ${match.duelWinner ? `
                          <div class="duel-badge">
                              <i class="fas fa-fist-raised"></i> برنده دوئل نهایی: ${match.duelWinner}
                          </div>
                      ` : ''}
                  </div>
                  
                  <div class="winner-badge" style="margin-top: 10px;">
                      <i class="fas fa-trophy"></i> تیم صعود کننده: ${match.winner}
                  </div>
              `;
            } else {
                matchCard.innerHTML = `
                  <div class="match-teams">
                      <span>${match.team1}</span>
                      <span class="match-vs">vs</span>
                      <span>${match.team2}</span>
                  </div>
                  
                  <div style="margin-top: 20px;">
                      <h4 style="color: var(--info);">
                          <i class="fas fa-arrow-right" style="margin-left: 5px;"></i>
                          بازی رفت
                      </h4>
                      ${match.leg1.completed ? `
                          <p>نتیجه: ${match.leg1.score1} - ${match.leg1.score2}</p>
                      ` : `
                          <div class="match-result">
                              <input type="number" class="score-input" id="sf${index}-leg1-score1" 
                                     placeholder="امتیاز" min="0" max="11" value="">
                              <span> - </span>
                              <input type="number" class="score-input" id="sf${index}-leg1-score2" 
                                     placeholder="امتیاز" min="0" max="11" value="">
                          </div>
                          <button onclick="submitKnockoutMatch(${index}, 'leg1')" 
                                  class="btn-primary" style="margin-top: 10px;">
                              <i class="fas fa-check-circle"></i> ثبت نتیجه رفت
                          </button>
                      `}
                  </div>
                  
                  <div style="margin-top: 25px;">
                      <h4 style="color: var(--info);">
                          <i class="fas fa-arrow-left" style="margin-left: 5px;"></i>
                          بازی برگشت
                      </h4>
                      ${match.leg2.completed ? `
                          <p>نتیجه: ${match.leg2.score1} - ${match.leg2.score2}</p>
                      ` : `
                          <div class="match-result">
                              <input type="number" class="score-input" id="sf${index}-leg2-score1" 
                                     placeholder="امتیاز" min="0" max="11" value="">
                              <span> - </span>
                              <input type="number" class="score-input" id="sf${index}-leg2-score2" 
                                     placeholder="امتیاز" min="0" max="11" value="">
                          </div>
                          <button onclick="submitKnockoutMatch(${index}, 'leg2')" 
                                  class="btn-primary" style="margin-top: 10px;">
                              <i class="fas fa-check-circle"></i> ثبت نتیجه برگشت
                          </button>
                      `}
                  </div>
              `;
            }

            semifinalDiv.appendChild(matchCard);
        }
    });
}
function displayFinalMatch() {
    const finalMatch = knockoutMatches.find(m => m.type === 'final');
    const finalDiv = document.getElementById('final-match');
    finalDiv.classList.remove('hidden');

    finalDiv.innerHTML = `
            <h3 style="color: var(--success);">
                <i class="fas fa-star" style="margin-left: 10px;"></i>
                بازی فینال
            </h3>
            <p>برنده باید به امتیاز 21 برسد</p>
            
            ${finalMatch.completed ? `
                <div class="match-card" style="border-left-color: var(--success);">
                    <div class="match-teams">
                        <span>${finalMatch.team1}</span>
                        <span class="match-vs">vs</span>
                        <span>${finalMatch.team2}</span>
                    </div>
                    
                    <div style="margin-top: 15px;">
                        <p><strong>نتیجه نهایی:</strong> ${finalMatch.score1} - ${finalMatch.score2}</p>
                        ${finalMatch.duelWinner ? `
                            <div class="duel-badge">
                                <i class="fas fa-fist-raised"></i> برنده دوئل: ${finalMatch.duelWinner}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="winner-badge" style="margin-top: 10px; background-color: var(--success);">
                        <i class="fas fa-trophy"></i> برنده فینال: ${finalMatch.winner}
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <button onclick="showWinner()" class="btn-accent">
                        <i class="fas fa-crown"></i> نمایش برنده نهایی
                    </button>
                </div>
            ` : `
                <div class="match-card" style="border-left-color: var(--success);">
                    <div class="match-teams">
                        <span>${finalMatch.team1}</span>
                        <span class="match-vs">vs</span>
                        <span>${finalMatch.team2}</span>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <div class="match-result">
                            <input type="number" class="score-input" id="final-score1" 
                                   placeholder="امتیاز" min="0" max="30">
                            <span> - </span>
                            <input type="number" class="score-input" id="final-score2" 
                                   placeholder="امتیاز" min="0" max="30">
                        </div>
                        <button onclick="submitFinalMatch()" 
                                class="btn-primary" style="margin-top: 10px;">
                            <i class="fas fa-check-circle"></i> ثبت نتیجه فینال
                        </button>
                    </div>
                </div>
            `}
        `;

    updateProgress();
}

window.submitFinalMatch = function () {
    const finalMatch = knockoutMatches.find(m => m.type === 'final');
    const score1Input = document.getElementById('final-score1');
    const score2Input = document.getElementById('final-score2');

    const score1 = parseInt(score1Input.value);
    const score2 = parseInt(score2Input.value);

    if (isNaN(score1) || isNaN(score2)) {
        alert('لطفاً برای هر دو تیم امتیاز وارد کنید');
        return;
    }

    if (score1 > 21 || score2 > 21) {
        alert('امتیاز هر تیم در مرحله فینال نمی‌تواند بیشتر از 21 باشد');
        return;
    }

    if (score1 === score2) {
        alert('بازی نمی‌تواند مساوی باشد!');
        return;
    }

    const validScores = [15, 16, 21];
    const team1Valid = validScores.includes(score1);
    const team2Valid = validScores.includes(score2);

    if (!team1Valid && !team2Valid) {
        alert('برای حداقل یکی از تیم‌ها باید یکی از اعداد 15، 16 یا 21 را وارد کنید');
        return;
    }

    finalMatch.score1 = score1;
    finalMatch.score2 = score2;

    if (score1 === 21 || score2 === 21) {
        finalMatch.winner = score1 > score2 ? finalMatch.team1 : finalMatch.team2;
        finalMatch.completed = true;
        showWinner();
    } else {
        const duelWinner = prompt(`لطفاً برنده دوئل بین ${finalMatch.team1} و ${finalMatch.team2} را انتخاب کنید (1 یا 2):\n1. ${finalMatch.team1}\n2. ${finalMatch.team2}`);

        if (duelWinner === '1') {
            finalMatch.duelWinner = finalMatch.team1;
        } else if (duelWinner === '2') {
            finalMatch.duelWinner = finalMatch.team2;
        } else {
            alert('انتخاب نامعتبر! لطفاً 1 یا 2 را وارد کنید.');
            return;
        }

        finalMatch.winner = finalMatch.duelWinner;
        finalMatch.completed = true;
        showWinner();
    }

    const matchCard = score1Input.closest('.match-card');
    matchCard.classList.add('animate__pulse');
    setTimeout(() => {
        matchCard.classList.remove('animate__pulse');
    }, 1000);
};

window.showWinner = function () {
    const finalMatch = knockoutMatches.find(m => m.type === 'final');

    document.getElementById('winner-section').classList.remove('hidden');
    document.getElementById('champion').textContent = finalMatch.winner;

    const messages = [
        `تیم ${finalMatch.winner} قهرمان شد!`,
        `تبریک به تیم ${finalMatch.winner} برای قهرمانی!`,
        `پیروزی با تیم ${finalMatch.winner} بود!`,
        `تیم ${finalMatch.winner} جام را بالای سر برد!`
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    document.getElementById('celebration-message').textContent = randomMessage;

    document.getElementById('winner-section').classList.add('animate__fadeIn');

    createConfetti();

    setTimeout(() => {
        document.getElementById('winner-section').scrollIntoView({ behavior: 'smooth' });
    }, 500);
};

function createConfetti() {
    const colors = ['#e91e63', '#4a148c', '#ff6f00', '#2e7d32', '#0277bd'];

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 10 + 5 + 'px';
        confetti.style.animationDelay = Math.random() * 5 + 's';
        confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
        document.body.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 7000);
    }
}

function updateProgress() {
    let progress = 0;

    if (currentStage === 'team-entry') {
        progress = 10;
    } else if (currentStage === 'group') {
        let totalMatches = 0;
        let completedMatches = 0;

        for (const groupName in groupMatches) {
            totalMatches += groupMatches[groupName].length;
            completedMatches += groupMatches[groupName].filter(m => m.completed).length;
        }

        progress = 10 + (completedMatches / totalMatches) * 40;
    } else if (currentStage === 'knockout') {
        progress = 50;

        const semifinals = knockoutMatches.filter(m => m.type === 'semifinal');
        if (semifinals.length > 0) {
            const completedSemifinals = semifinals.filter(m => m.completed).length;
            progress += (completedSemifinals / semifinals.length) * 30;
        }

        const final = knockoutMatches.find(m => m.type === 'final');
        if (final) {
            if (final.completed) {
                progress = 100;
            } else {
                progress += 20;
            }
        }
    }

    document.getElementById('group-progress').style.width = progress + '%';
    document.getElementById('knockout-progress').style.width = progress + '%';
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function toggleScrollButton() {
    const scrollButton = document.getElementById('scroll-to-top');
    if (window.scrollY > 300) {
        scrollButton.classList.remove('hidden');
    } else {
        scrollButton.classList.add('hidden');
    }
}

function restartTournament() {
    document.querySelectorAll('.confetti').forEach(el => el.remove());

    teams = [];
    groups = { A: [], B: [] };
    groupStandings = { A: {}, B: {} };
    groupMatches = { A: [], B: [] };
    knockoutMatches = [];
    currentStage = 'team-entry';

    document.getElementById('group-stage').classList.add('hidden');
    document.getElementById('knockout-stage').classList.add('hidden');
    document.getElementById('winner-section').classList.add('hidden');

    document.getElementById('team-entry').classList.remove('hidden');
    document.getElementById('team-entry').classList.add('animate__fadeIn');

    document.querySelectorAll('.team-name').forEach(input => {
        input.value = '';
    });

    scrollToTop();
}

function generateFinalMatch() {
    const finalists = knockoutMatches.filter(m => m.type === 'semifinal').map(match => match.winner);

    knockoutMatches.push({
        type: 'final',
        match: `${finalists[0]} vs ${finalists[1]}`,
        team1: finalists[0],
        team2: finalists[1],
        score1: 0,
        score2: 0,
        duelWinner: null,
        winner: null,
        completed: false
    });

    const finalDiv = document.getElementById('final-match');
    finalDiv.classList.remove('hidden');
    finalDiv.innerHTML = `
    <h3 style="color: var(--success);">
        <i class="fas fa-star" style="margin-left: 10px;"></i>
        بازی فینال
    </h3>
    <p>برنده باید به امتیاز 21 برسد</p>
    
    <div class="match-card" style="border-left-color: var(--success);">
        <div class="match-teams">
            <span>${finalists[0]}</span>
            <span class="match-vs">vs</span>
            <span>${finalists[1]}</span>
        </div>
        
        <div style="margin-top: 20px;">
            <div class="match-result">
                <input type="number" class="score-input" id="final-score1" 
                       placeholder="امتیاز" min="0" max="30">
                <span> - </span>
                <input type="number" class="score-input" id="final-score2" 
                       placeholder="امتیاز" min="0" max="30">
            </div>
            <button onclick="submitFinalMatch()" 
                    class="btn-primary" style="margin-top: 10px;">
                <i class="fas fa-check-circle"></i> ثبت نتیجه فینال
            </button>
        </div>
    </div>
`;

    setTimeout(() => {
        finalDiv.scrollIntoView({ behavior: 'smooth' });
    }, 500);
}