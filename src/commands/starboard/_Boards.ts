class Boards {
    //this doesn't work yet
    static boardNames: string[] = [];
    static boardIDs: string[] = [];
    static boardEmojis: string[] = [];
    static boardMins: number[] = [];
    /**
     * 
     * @returns all the information about all boards
     */
    public static getBoardInfo(){
        return [Boards.boardNames, Boards.boardIDs, Boards.boardEmojis, Boards.boardMins]
    }
    /** 
    * adds the information of the new board into arrays
    * @param name: the name of the board
    * @param id: the ID of the board
    * @param emoji: the emoji of the board
    * @param min: the minimum number of emojis required to get on the board
    */
    public static addBoard(name: string, id: string, emoji: string, min: number){
        Boards.boardNames.push(name);
        Boards.boardIDs.push(id);
        Boards.boardEmojis.push(emoji);
        Boards.boardMins.push(min);
    }
    /** 
    * removes the information of a board from all arrays
    * @param id: the ID of the board
    */
    public static removeBoard(id: string){
        const idx = Boards.boardNames.indexOf(id);
        Boards.boardNames.splice(idx, 1);
        Boards.boardIDs.splice(idx, 1);
        Boards.boardEmojis.splice(idx, 1);
        Boards.boardMins.splice(idx, 1);
    }
    //TODO: add methods for changing channel, emoji, and minimum
}
export default Boards;