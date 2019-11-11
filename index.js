//[TODO] $data에 붙여쓰게 직접 어레이 조작 (대체 안하고)
//[TODO] uniq 필드 설정
//[TODO] ttl options으로 설정
//[TODO] 특정 필드만 살리기

class Queue {

    constructor(size, ttl_ms, ttl_field) {
        this.q = []
        this.limitSize = size
        this.limit_TTL_ms = ttl_ms;
        this.limit_TTL_field = ttl_field;
    }

    push(item) {
        this.q.push(item)
        this.cutLimitSize()
    }

    cutLimitSize() {
        if (this.q.length > this.limitSize)
            this.q.shift()
    }

    cutLimitTTL() {
        //this.q = this.q.splice(this.q.length - this.limitSize, this.limitSize)
    }

    pushUnique(item, idField) {
        let r = false

        this.q.forEach(i => {
            if (r == true) return;
            r = (i[idField] == item[idField])
        })

        if (r) return;

        this.push(item)
    }

    find(matchObject) {
        let output = []

        this.q.forEach(i => {
            let r = true;

            for (let key in matchObject) {
                r = r  && (i[key] == matchObject[key])
                if (!r) break;
            }

            if (r) output.push(i)
        })

        return output
    }

}

module.exports = {
    Queue: Queue
}