const nameKey = "default-name";
export const nameStorage = {
    saveName(name: string) {
        localStorage.setItem(nameKey, name);
    },
    loadName(): string {
        return localStorage.getItem(nameKey) || "";
    }
}

type Score = {
    name: string;
    value: number;
    timestamp: number;
}

const scoreKey = "scores";

const loadScores =  (): Score[] => {
        const rawScores = localStorage.getItem(scoreKey);
        if (!rawScores) {
            return [];
        }
        return JSON.parse(rawScores) as Score[];
}

export const scoreStorage = {
    loadScores,
    addScore(score: Score): Score[] {
        const scores = loadScores();
        scores.push(score);
        scores.sort((a, b) => {
            if (a.value !== b.value) {
                return b.value - a.value;
            }
            return a.timestamp- b.timestamp;
        });
        const newScores = scores.slice(0, 10);
        localStorage.setItem(scoreKey, JSON.stringify(newScores));
        return newScores;
    },
}