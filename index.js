//[TODO] $data에 붙여쓰게 직접 어레이 조작 (대체 안하고)
//[TODO] uniq 필드 설정
//[TODO] ttl options으로 설정
//[TODO] 특정 필드만 살리기

// TTL은 ms 단위
//const DEFALUT_TTL = 24*60*60*1000 // 1 DAY
//const DEFALUT_TTL_FIELD = 'exp'
//const DEFAULT_UNIQUE_FIELD = 'id'

const inspect = Symbol.for('nodejs.util.inspect.custom');


class Queue {

    constructor(optionsOrSize) {
        this.q = []

        if (optionsOrSize && optionsOrSize.constructor == Object) {
            this.limitSize = optionsOrSize.size
            this.unique    = optionsOrSize.unique
            this.TTL_ms    = optionsOrSize.ttl
            this.TTL_field = optionsOrSize.ttl_field
        } else {
            this.limitSize = optionsOrSize
        }

    }

    get length() {
        this.cutByTTL()
        return this.q.length;
    }

    set length(v) {
        this.q.length = v
    }

    push(item) {
        this.cutByTTL()

        if (Array.isArray(item)) {

            if (this.unique === true) {
                item = item.filter(i => !this.q.includes(i))
            } else if (this.unique) {
                item = item.filter(i => {
                    let o = {};
                    o[this.unique] = i[this.unique];
                    return (this.find(o).length == 0);
                })
            }

            if (item.length < 1) return;

            // fastest add push method
            // https://dev.to/uilicious/javascript-array-push-is-945x-faster-than-array-concat-1oki
            let arrLen = this.q.length;
            this.q.length = arrLen + item.length;

            for (let i =0; i < item.length; i++) {

                // TTL 추가
                if (this.TTL_field) {
                    if (item[i][this.TTL_field] == undefined) {
                        item[i][this.TTL_field] = Date.now()+this.TTL_ms;
                    } else if (Math.abs(item[i][this.TTL_field]) < 1000000000000) {
                        item[i][this.TTL_field] += Date.now()
                    }
                }

                this.q[arrLen + i] = item[i];
            }

        } else {

            if (this.unique === true) {
                if (this.q.includes(item)) return;
            } else if (this.unique) {
                let o = {};
                o[this.unique] = item[this.unique];

                if (this.find(o).length > 0) return;
            }

            this.q.push(item)
        }

        this.cutByTTL()
        this.cutLimitSize()
    }

    pop() { // FIFO 구현
        this.cutByTTL()
        return this.q.splice(0,1)[0]
    }

    cutLimitSize() {
        if (this.limitSize == undefined) return;

        let s = (this.q.length - this.limitSize)
        if (s > 0) this.q.splice(0, s);
    }

    getQueue() {
        return this.q.slice(); // shallow copy 복제본 제공.
    }

    getRef() {
        return this.q; // 레퍼런스로 제공.
    }

    cutByTTL() {
        if (!this.TTL_field) return;

        let expired = []

        for (let i=0; i < this.q.length; i++) {
            let item = this.q[i];

            if (item && item.constructor == Object) {

                if (item[this.TTL_field] == undefined || item[this.TTL_field] === 0)
                    continue;

                if (item[this.TTL_field] < Date.now()) {
                    expired.push(i);
                }
            } else continue;
        }

        if (expired.length < 1) return;

        let count = 0;

        for (let i=0; i<expired.length; i++) {
            let idx = expired[i] - count;

            this.q.splice(idx, 1);
            count++;
        }
    }

    has(item) {
        return this.q.includes(item)
    }

    find(matchObject) {

        this.cutByTTL()

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

    [inspect]() {
        return this.q;
    }

}



module.exports = Queue