var maxStopWordLength = 7;

function spoonAll() {
    var unwantedFilter = {
        acceptNode: function (node) {
            if (
                node.parentNode.nodeName !== "SCRIPT" &&
                node.parentElement.tagName != "STYLE"
            ) {
                return NodeFilter.FILTER_ACCEPT;
            }
        },
    };

    var elements = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        unwantedFilter
    );
    while (elements.nextNode()) {
        var node = elements.currentNode;
        if (node.spooned == undefined || node.spooned == false) {
            node.nodeValue = spoonerize(node.nodeValue);
            node.spooned = true;
        }
    }
}

function isLetter(char) {
    return char.toUpperCase() != char.toLowerCase();
}

function isNotLetter(char) {
    return !isLetter(char);
}

function isSpace(char) {
    return /\s/.test(char);
}

function isUpper(char) {
    return char === char.toUpperCase();
}

function isLower(char) {
    return char === char.toLowerCase();
}

function advanceUntil(text, i, fn) {
    let j = i;
    while (j < text.length && !fn(text[j])) {
        j++;
    }
    return j;
}

function swapLetters(text, i1, s1, i2, s2) {
    let prefix1 = [], prefix2 = [];
    prefix1.splice(0, s1, ...text.slice(i1, i1 + s1));
    prefix2.splice(0, s2, ...text.slice(i2, i2 + s2));
    let diff = s2 - s1;
    text.splice(i1 + s1 + diff, i2 - i1 - s1, ...text.slice(i1 + s1, i2));
    let upper1 = isUpper(prefix1[0]);
    let upper2 = isUpper(prefix2[0]);
    text.splice(i2 + diff, s1, ...prefix1);
    text.splice(i1, s2, ...prefix2);
    if (upper1 != upper2) {
        if (upper1) {
            text[i1] = text[i1].toUpperCase();
            text[i2 + diff] = text[i2 + diff].toLowerCase();
        } else {
            text[i1] = text[i1].toLowerCase();
            text[i2 + diff] = text[i2 + diff].toUpperCase();
        }
    }
    return text;
}

function getNextPrefix(text, k) {
    let j = k;
    let start = advanceUntil(text, j, isLetter);
    let end = advanceUntil(text, start, isNotLetter);
    let size = end - start;
    j = advanceUntil(text, end, isSpace);

    if (size == 0) {
        return [-1, -1, j];
    }

    if (!/^[\000-\177]*$/.test(text.slice(start, start + 1).join(""))) {
        return [-1, -1, j];
    }

    if (size > maxStopWordLength) {
        size = maxStopWordLength;
    }

    let lower = [];
    for (let i = 0; i < size; i++) {
        lower[i] = text[start + i].toLowerCase();
    }

    if (lower[0] in vowels) {
        return [-1, -1, j];
    }

    if (lower.join("") in stopWords) {
        return [-1, -1, j];
    }

    if (size > 2 && lower.slice(0, 3).join("") in trigraphs) {
        return [start, 3, j];
    }

    if (size > 1 && lower.slice(0, 2).join("") in digraphs) {
        return [start, 2, j];
    }

    return [start, 1, j];
}

function spoonerize(sent) {
    let text = sent.split("");
    let start = -1;
    let size = 0;
    let tempStart = -1;
    let tempSize = 0;
    for (let i = 0; i < text.length; i++) {
        prs = getNextPrefix(text, i);
        tempStart = prs[0];
        tempSize = prs[1];
        i = prs[2];
        if (tempStart < 0 || tempSize <= 0) {
            continue;
        }
        if (start < 0 || size <= 0) {
            start = tempStart;
            size = tempSize;
        } else {
            swapLetters(text, start, size, tempStart, tempSize);
            start = -1;
            size = -1;
        }
    }
    return text.join("");
}

function spoonLoop() {
    spoonAll();
    setInterval(() => spoonAll(), 1000);
}

chrome.runtime.sendMessage(
    { msg: "enabled"},
    (response) => {
        if (response == true) {
            spoonLoop();
        }
    }
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message == true) {
        spoonLoop();
    }
});

var vowels = {
    a: true,
    e: true,
    i: true,
    o: true,
    u: true,
};

var digraphs = {
    bl: true,
    br: true,
    ch: true,
    ck: true,
    cl: true,
    cr: true,
    dr: true,
    fl: true,
    fr: true,
    gh: true,
    gl: true,
    gr: true,
    ng: true,
    ph: true,
    pl: true,
    pr: true,
    qu: true,
    sc: true,
    sh: true,
    sk: true,
    sl: true,
    sm: true,
    sn: true,
    sp: true,
    st: true,
    sw: true,
    th: true,
    tr: true,
    tw: true,
    wh: true,
    wr: true,
};

var trigraphs = {
    sch: true,
    scr: true,
    shr: true,
    spl: true,
    spr: true,
    squ: true,
    str: true,
    thr: true,
};

var stopWords = {
    a: true,
    able: true,
    about: true,
    across: true,
    after: true,
    all: true,
    almost: true,
    also: true,
    am: true,
    among: true,
    an: true,
    and: true,
    any: true,
    are: true,
    as: true,
    at: true,
    be: true,
    because: true,
    been: true,
    but: true,
    by: true,
    can: true,
    cannot: true,
    could: true,
    dear: true,
    did: true,
    do: true,
    does: true,
    either: true,
    else: true,
    ever: true,
    every: true,
    for: true,
    from: true,
    get: true,
    got: true,
    had: true,
    has: true,
    have: true,
    he: true,
    her: true,
    hers: true,
    him: true,
    his: true,
    how: true,
    however: true,
    i: true,
    if: true,
    in: true,
    into: true,
    is: true,
    it: true,
    its: true,
    just: true,
    least: true,
    let: true,
    like: true,
    likely: true,
    may: true,
    me: true,
    might: true,
    most: true,
    must: true,
    my: true,
    neither: true,
    no: true,
    nor: true,
    not: true,
    of: true,
    off: true,
    often: true,
    on: true,
    only: true,
    or: true,
    other: true,
    our: true,
    own: true,
    rather: true,
    said: true,
    say: true,
    says: true,
    she: true,
    should: true,
    since: true,
    so: true,
    some: true,
    than: true,
    that: true,
    the: true,
    their: true,
    them: true,
    then: true,
    there: true,
    these: true,
    they: true,
    this: true,
    tis: true,
    to: true,
    too: true,
    twas: true,
    us: true,
    wants: true,
    was: true,
    we: true,
    were: true,
    what: true,
    when: true,
    where: true,
    which: true,
    while: true,
    who: true,
    whom: true,
    why: true,
    will: true,
    with: true,
    would: true,
    yet: true,
    you: true,
    your: true,
};

