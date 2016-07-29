import {expect} from 'chai';
import {List, Map, fromJS} from 'immutable';
import {setEntries, next, vote} from '../src/core';

describe('application logic', () => {
  describe('set entries', () => {
    it('adds entries to state', () => {
      const state = Map();
      const entries = List.of("one", "two");
      const nextState = setEntries(state, entries);
      expect(nextState).to.equal(Map({
        entries: List.of("one", "two")
      }));
    });

    it('converts to immutable', () => {
      const state = Map();
      const entries = ['Trainspotting', '28 Days Later'];
      const nextState = setEntries(state, entries);
      expect(nextState).to.equal(Map({
        entries: List.of('Trainspotting', '28 Days Later')
      }));
    });
  });

  describe('next', () => {
    it('takes next to entries and adds it to vote', () => {
      const state = Map({
        entries: List.of("one", "two", "three")
      });
      const nextState = next(state);
      expect(nextState).to.equal(Map({
        entries: List.of("three"),
        vote: Map({
          pair: List.of("one", "two")
        })
      }))
    });

    it('puts winner of current vote back in entries', () => {
      const state = fromJS({
        entries: ["three", "four", "five"],
        vote: {
          pair: ["one", "two"],
          tally: {
            "one": 2,
            "two": 1
          }
        }
      })

      const nextState = next(state)
      expect(nextState).to.equal(fromJS({
        entries: ["five", "one"],
        vote: {
          pair: ["three", "four"]
        }
      }))
    })

    it('puts both from tied vote back in entries', () => {
      const state = fromJS({
        entries: [],
        vote: {
          pair: ["one", "two"],
          tally: {
            "one": 1,
            "two": 1
          }
        }
      })

      const nextState = next(state)
      expect(nextState).to.equal(fromJS({
        entries: [],
        vote: {
          pair: ["one", "two"]
        }
      }))
    })

    it('puts new entries after vote', () => {
      const state = fromJS({
        entries: ["three", "four"],
        vote: {
          pair: ["one", "two"],
          tally: {
            "one": 2,
            "two": 1
          }
        }
      })

      const nextState = next(state)
      expect(nextState).to.equal(fromJS({
        entries: ["one"],
        vote: {
          pair: ["three", "four"]
        }
      }))
    })

    it('puts winner of current vote back to entries', () => {
      const state = Map({
        vote: Map({
          pair: List.of('Trainspotting', '28 Days Later'),
          tally: Map({
            'Trainspotting': 4,
            '28 Days Later': 2
          })
        }),
        entries: List.of('Sunshine', 'Millions', '127 Hours')
      });
      const nextState = next(state);
      expect(nextState).to.equal(Map({
        vote: Map({
          pair: List.of('Sunshine', 'Millions')
        }),
        entries: List.of('127 Hours', 'Trainspotting')
      }));
    });

    it('puts both from tied vote back to entries', () => {
      const state = Map({
        vote: Map({
          pair: List.of('Trainspotting', '28 Days Later'),
          tally: Map({
            'Trainspotting': 3,
            '28 Days Later': 3
          })
        }),
        entries: List.of('Sunshine', 'Millions', '127 Hours')
      });
      const nextState = next(state);
      expect(nextState).to.equal(Map({
        vote: Map({
          pair: List.of('Sunshine', 'Millions')
        }),
        entries: List.of('127 Hours', 'Trainspotting', '28 Days Later')
      }));
    });

    it('marks winner when just one entry is left', () => {
      const state = fromJS({
        entries: [],
        vote: {
          pair: ["one", "two"],
          tally: {
            "one": 4,
            "two": 2
          }
        }
      });

      const nextState = next(state);
      expect(nextState).to.equal(fromJS({
        winner: "one"
      }));
    });
  });

  describe('vote', () => {
    it('increments tally if none exists', () => {
      const state = fromJS({
        entries: [],
        vote: {
          pair: ["one", "two"]
        }
      })
      const nextState = vote(state, "one")
      expect(nextState).to.equal(fromJS({
        entries: [],
        vote: {
          pair: ["one", "two"],
          tally: {
            "one": 1
          }
        }
      }))
    })

    it('increments tally if some exists', () => {
      const state = Map({
        entries: List.of("three"),
        vote: Map({
          pair: List.of("one", "two"),
          tally: Map({
            "one": 1,
            "two": 1
          })
        })
      })
      const nextState = vote(state, "one")
      expect(nextState).to.equal(Map({
        entries: List.of("three"),
        vote: Map({
          pair: List.of("one", "two"),
          tally: Map({
            "one": 2,
            "two": 1
          })
        })
      }));
    });
  })
});
