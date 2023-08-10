export default class FullGraphState {
    public readonly LinkTypeCheckBoxesStates: {[id: string] : boolean} = {
        "bid": true,
        "witness": true,
        "cowitness": true,
        "cobid": true,
        "take": true,
        "cotake": true
    };

    public readonly classNamesToCheckboxId: {[className: string]: string} = {
        "CoOpen": "bid",
        "WitnessOpening": "witness",
        "CoWitnessOpening": "cowitness", 
        "Overbid": "bid",
        "CoOverbid": "cobid",
        "WitnessOverbid": "witness",
        "CoWitnessOverbid": "cowitness",
        "TakeOver": "take",
        "CoTakeOver": "cotake",
        "WitnessTake": "witness",
        "CoWitnessTake": "cowitness"
    };
}