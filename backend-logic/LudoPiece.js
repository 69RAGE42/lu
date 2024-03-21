class LudoPiece {
    constructor(color, name, playerId, board) {
        this.name = name
        this.color = color
        this.board = board
        for (let pos of LudoHomePositions[color]) { if (!this.board.getPiecesOnPosition(pos)) { this.position = pos; break } }
        this.isLocked = true
        this.reachedGoal = false
        this.playerId = playerId
        this.isSafe = false
        this.wasLastKill = false
    }

    move(num) {
        if (!this.position) return;

        // only unlock on 6 if locked
        if (this.isLocked && num != 6) return
        else if (this.isLocked && num === 6) return this.unlock()

        // we are moving on...
        if (this.wasLastKill) this.wasLastKill = false

        for (let i = 1; i != num + 1; i++) {
            if (this.position === 52 && i - 1 === num) this.position = 52
            else if (this.position === 52) this.position = 0

            if (LudoEntrypoints[this.color] === this.position && i - 1 != num) {
                this.position = LudoWinningHallPositions[this.color][0]
                continue
            }

            this.position += 1

            // check if we reached goal
            this.reachedGoal = LudoWinningPositions[this.color] === this.position
            if (this.reachedGoal) return
        }

        // check if we're safe
        this.isSafe = LudoStarPositions.includes(this.position)

        // check who's sittin on the tile, kill if enemy
        let tilePieces = this.board.getPiecesOnPosition(this.position)
        if (tilePieces && tilePieces.length) for (let piece of tilePieces) {
            if (piece.color === this.color) continue
            this.kill(piece)
            break
        }
    }

    unlock() {
        this.position = LudoUnlockPositions[this.color]
        this.isLocked = false
        this.isSafe = true
    }

    kill(target) {
        if (target.isSafe) return;
        target.lock()
        this.wasLastKill = true
        this.board.currentTurn.availableTurns++;
        this.board.rolledSixes = 0;
    }

    lock() {
        LudoHomePositions[this.color].forEach(pos => {
            if (!this.board.getPiecesOnPosition(pos, this.playerId)) {
                this.position = pos
                this.isLocked = true
                return
            }
        })
    }

    isMovable(num) {
        if (!this.position) return;

        if (this.isLocked && num != 6) return false
        if ((this.position > 99 && this.position < 150) && ((this.position + num) > LudoWinningPositions[this.color])) return false
        return true
    }
}