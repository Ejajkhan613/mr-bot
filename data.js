export const talkData = {
    greetings: [],
    smalltalk: [],
    compliments: [],
    busy: [],
    full: []
};

export async function loadAllTalkData() {
    const files = ['greetings', 'smalltalk', 'compliments', 'busy', 'full'];
    for (const file of files) {
        try {
            const response = await fetch(`${file}.json`);
            const data = await response.json();
            talkData[file] = data.phrases;
        } catch (e) {
            console.warn(`Could not load ${file}.json`);
            talkData[file] = ["..."];
        }
    }
}
