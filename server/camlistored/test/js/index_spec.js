describe("IndexCtrl", function() {
    var ctrl, httpBackend, scope;

    beforeEach(module( "camli" ));
    
    beforeEach(inject(function($controller, $rootScope, $httpBackend) {
        httpBackend = $httpBackend;
        $httpBackend.whenGET(/my-search/).respond(DATA);
        scope = $rootScope.$new();
        ctrl = $controller("IndexCtrl", {
            $scope: scope
      });
    }));

    afterEach(function() {
      httpBackend.verifyNoOutstandingExpectation();
      return httpBackend.verifyNoOutstandingRequest();
    });

    describe( "#thumnailSpan", function() { 
        it( "should have span1 to start", function() {
            scope.setupThumbnailSizes();
            expect( scope.thumbnailSpan() ).toEqual( "span1" );
        });

        it( "should have span2 after bumping size", function() {
            scope.setupThumbnailSizes();
            expect( scope.thumbnailSpan() ).toEqual( "span1" );
            scope.larger()
            scope.larger()
            scope.larger()
            expect( scope.thumbnailSpan() ).toEqual( "span2" );
        });
    });

    describe( "#thumbSize", function() {
        it( "should have the proper sized thumbnail to start (100)", function() {
            scope.setupThumbnailSizes();
            expect( scope.thumbSize() ).toEqual( 100 );
        })
    });

    describe( "#smaller", function() {
        it( "should make something smaller", function() {
            scope.setupThumbnailSizes();
            scope.smaller();
            expect( scope.thumbSize() ).toEqual( 75 );
        });

        it( "should never go past smallest size", function() {
            scope.setupThumbnailSizes();
            scope.smaller();
            scope.smaller();
            scope.smaller();
            expect( scope.thumbSize() ).toEqual( 25 );
            scope.smaller();
            expect( scope.thumbSize() ).toEqual( 25 );
        });
    });

    describe("#resolvedItem", function() {
      return it("should resolve an item (get back the file) from the JSON results coming from the server", function() {
          // Manually call the init function to load the data
          scope.init();
          httpBackend.flush();
          expect( scope.resolvedItem( scope.items[0] ).file.fileName ).toEqual( DATA.meta["sha1-0ed5b9b79b8f0f47ab192475829cf669248e20ae"].file.fileName );
          expect( scope.resolvedItem( scope.items[0] ).file.fileName ).toEqual( "Photo_013108_007.jpg" );
      });
    });
});
