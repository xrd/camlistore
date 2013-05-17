mod.controller( 'IndexCtrl', [ '$scope', '$resource', function( $scope, $resource ) {

    console.log( "Created indexctrl" );
    
    var CamliResource = $resource( Camli.config.searchRoot + "camli/search/recent", {}, {
        recent: { isArray: false, method: 'GET' }
    } );
    
    $scope.thumbSizes = CamliIndexPage.thumbSizes;
    $scope.thumbSizeIdx = CamliIndexPage.thumbSizeIdx;
    
    $scope.adjustThumbSize = function( idxDelta ) {
        var newSize = $scope.thumbSizeIdx + idxDelta;
        if (newSize < 0 || newSize >= $scope.thumbSizes.length) {
            return;
        }
        $scope.thumbSizeIdx = newSize;   
    }

    $scope.smaller = function() {
        $scope.adjustThumbSize(-1);
    }
    $scope.larger = function() {
        $scope.adjustThumbSize(1);
    }

    $scope.thumbnailSpan = function() {
        // Keep span to 1 or the size necessary for our bootstrap grid
        return "span" + Math.max( 1, parseInt( $scope.thumbSize() / 78 ) );
    }

    $scope.thumbSize = function() {
        return $scope.thumbSizes[$scope.thumbSizeIdx];
    }

    $scope.resolvedItem = function( item ) {
        return $scope.meta[$scope.meta[item.blobref].permanode.attr.camliContent];
    }

    $scope.thumbnailSrc = function( item ) {
        var resolved = $scope.resolvedItem( item );
        var imgRef = resolved.blobRef;
        var imgName = resolved.file.fileName;
        return imgRef + "/" + imgName + "?mw=" + $scope.thumbSize() + "&mh=" + $scope.thumbSize();
    }

    $scope.init = function() {
        console.log( "Loading items" );
        CamliResource.recent( {}, function( response ) {
            $scope.items = response.recent;
            $scope.meta = response.meta;
        });
    }
} ] );
