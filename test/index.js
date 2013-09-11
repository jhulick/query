if ('undefined' === typeof window) {
  var query = require('..');
  var assert = require('assert');
} else {
  var query = require('tower-query');
  var assert = require('timoxley-assert');
}

var stream = require('tower-stream');
var adapter = require('tower-adapter');
var Constraint = query.Constraint;

describe('query', function(){
  it('should select minimum-cost maximum-flow', function(){
    var topology = query()
      // mapped(user) -> reduced(user)
      .resource('user')
      .resource('facebook.user')
      .resource('twitter.user')
      // random constraints purely on the resources
      .where('user.likeCount').gte(10)
      .where('facebook.likeCount').gte(20)
      // constraints between resources
      // .on('exec', function(context) { context.tests[user.id] = context.constraints.length })
      // if (context.tests[user.id] === 0)
      //    it passed all the constraints! it's been reduced!
      //
      // mapped(facebook.user) -> reduced(facebook.user)
      // reduced(facebook.user) -> reduced(user)
      // fetch facebook.user first, and use those records against `user`.
      .where('user.email', 'facebook.user.email')
      // twitter.user -> reduced(facebook.user)
      .where('facebook.user.username', 'twitter.user.username')
      // twitter.user -> reduced(user)
      .where('user.firstName', 'twitter.user.firstName')
      .returns('user');

    // 6: [user, facebook.user, twitter.user, constraints(user), constriants(facebook.user)]
    // assert(6 === topology.size())

    // only query `users` who have a `facebook.user.email`

    // only query `twitter.user` who's firstName is the same as a `user`
    // same as the reverse.
    // only query `user` who's firstName is the same as a `twitter.user`

    // labelled edges would allow same "edge" between node
    // to be evaluated separately (multigraph?).
    // twitter -> user == "twitter-first"
    // user -> twitter == "user-first"
    // there is then a cost associated with doing one first over the other,
    // based on our knowledge of how many http requests vs. db requests
    // it'd have to make to get the result.

    // I am pretty sure this is a "circulation" problem, not 100% though.
    // http://en.wikipedia.org/wiki/Directed_acyclic_graph

    // build a dependency graph, must be acyclic
  });

  it('should select minimum-cost maximum-flow in an easier way (graph api)', function(){
    //var topology = query()
    //  .start('user')
    //  .incoming('facebook.user')
    //  .topology();
  });

  it('should execute adapter', function(done){
    adapter('example')
      .resource('user')
        .action('select');

    adapter('example').exec = function(query, fn){
      assert(1 === query.resources.length);
      fn();
    }

    query()
      .use('example')
      .resource('user')
      .select(done);
  });

  it('should save named queries', function(){
    var named = query('foo')
      .where('x', 1);

    assert(named.name === query('foo').name);
  });

  it('should validate a query', function(done){
    // XXX: constraints are defaulting to 'memory'
    //      instead of `exports.adapters[0]`.
    // adapter('example')
    adapter('memory')
      .resource('foo')
        .action('select')
          .param('bar', 'string')
            .validate('in', [ 'a', 'b' ]);

    query()
      .use('memory')
      .resource('foo')
      .where('bar').eq('x')
      .action('select')
      .validate(function(err){
        assert(1 === err.length);
        // assert.deepEqual([ 'Invalid foo.bar' ], err);
        done();
      });
  });

  describe('filter', function(){
    it('should filter', function(){
      var records = [
          { title: 'foo', x: 10 }
        , { title: 'bar', x: 15 }
        , { title: 'baz', x: 20 }
        , { title: 'box', x: 25 }
      ];

      var constraints = [
          new Constraint('x', 'gt', 10)
        , new Constraint('title', 'match', /ba/)
      ];

      var result = query.filter(records, constraints);
      assert(2 === result.length);
      assert.deepEqual(records[1], result[0]);
      assert.deepEqual(records[2], result[1]);
    });
  });

  describe('constraints', function(){
    it('should validate', function(){
      var constraint = new Constraint('count', 'gte', 12);
      assert(false === query.validate({ count: 10 }, [constraint]));
    });

    it('should validate `in` array', function(){
      assert(true === query.validate({ x: 2 }, [new Constraint('x', 'in', [1, 2, 3])]));
      assert(false === query.validate({ x: 7 }, [new Constraint('x', 'in', [1, 2, 3])]));
      // XXX: any other cases?
    });

    it('should validate `nin` array', function(){
      assert(false === query.validate({ x: 2 }, [new Constraint('x', 'nin', [1, 2, 3])]));
      assert(true === query.validate({ x: 7 }, [new Constraint('x', 'nin', [1, 2, 3])]));
      // XXX: any other cases?
    });
  });

  describe('subscriber', function(){
    it('should subscribe', function(done){
      return done();
      query().subscribe(function(){
        console.log('here')
        done();
      });
    });

    it('should unsubscribe');
  });
});