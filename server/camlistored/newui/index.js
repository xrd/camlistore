/**
 * @fileoverview Entry point for the blob browser UI.
 *
 */
goog.provide('camlistore.IndexPage');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component');
goog.require('camlistore.BlobItemContainer');
goog.require('camlistore.ServerConnection');
goog.require('camlistore.Toolbar');
goog.require('camlistore.Toolbar.EventType');

// TODO(mpl): Brett, this is just a quick hack so that IndexPage
// can be called from index.html when the js has been minified.
// Please feel free to remove when you've moved forward with this.
window["newIndexPage"] = function(config, body) {
  var page = new camlistore.IndexPage(config);
  page.decorate(body);
};


/**
 * @param {camlistore.ServerType.DiscoveryDocument} config Global config
 *   of the current server this page is being rendered for.
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper to use.
 *
 * @extends {goog.ui.Component}
 * @constructor
 */
camlistore.IndexPage = function(config, opt_domHelper) {
  goog.base(this, opt_domHelper);

  /**
   * @type {Object}
   * @private
   */
  this.config_ = config;

  /**
   * @type {camlistore.ServerConnection}
   * @private
   */
  this.connection_ = new camlistore.ServerConnection(config);

  /**
   * @type {camlistore.BlobItemContainer}
   * @private
   */
  this.blobItemContainer_ = new camlistore.BlobItemContainer(
      this.connection_, opt_domHelper);
  this.blobItemContainer_.setHasCreateItem(true);

  /**
   * @type {camlistore.Toolbar}
   * @private
   */
  this.toolbar_ = new camlistore.Toolbar(opt_domHelper);

  /**
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eh_ = new goog.events.EventHandler(this);
};
goog.inherits(camlistore.IndexPage, goog.ui.Component);



/**
 * Creates an initial DOM representation for the component.
 */
camlistore.IndexPage.prototype.createDom = function() {
  this.decorateInternal(this.dom_.createElement('div'));
};


/**
 * Decorates an existing HTML DIV element.
 * @param {Element} element The DIV element to decorate.
 */
camlistore.IndexPage.prototype.decorateInternal = function(element) {
  camlistore.IndexPage.superClass_.decorateInternal.call(this, element);

  var el = this.getElement();
  goog.dom.classes.add(el, 'cam-index-page');

  var titleEl = this.dom_.createDom('h1', 'cam-index-page-title');
  this.dom_.setTextContent(titleEl, this.config_.ownerName + '\'s Vault');
  this.dom_.appendChild(el, titleEl);

  this.addChild(this.toolbar_, true);
  this.addChild(this.blobItemContainer_, true);
};


/** @override */
camlistore.IndexPage.prototype.disposeInternal = function() {
  camlistore.IndexPage.superClass_.disposeInternal.call(this);
  this.eh_.dispose();
};


/**
 * Called when component's element is known to be in the document.
 */
camlistore.IndexPage.prototype.enterDocument = function() {
  camlistore.IndexPage.superClass_.enterDocument.call(this);

  this.eh_.listen(
      this.toolbar_, camlistore.Toolbar.EventType.BIGGER,
      function() {
        if (this.blobItemContainer_.bigger()) {
          this.blobItemContainer_.showRecent();
        }
      });

  this.eh_.listen(
      this.toolbar_, camlistore.Toolbar.EventType.SMALLER,
      function() {
        if (this.blobItemContainer_.smaller()) {
          this.blobItemContainer_.showRecent();
        }
      });

  this.eh_.listen(
      this.toolbar_, camlistore.Toolbar.EventType.CHECKED_ITEMS_CREATE_SET,
      function() {
        var blobItems = this.blobItemContainer_.getCheckedBlobItems();
        this.createNewSetWithItems_(blobItems);
      });

  this.eh_.listen(
      this.blobItemContainer_,
      camlistore.BlobItemContainer.EventType.BLOB_ITEMS_CHOSEN,
      function() {
        var blobItems = this.blobItemContainer_.getCheckedBlobItems();
        this.toolbar_.setCheckedBlobItemCount(blobItems.length);
      });

  this.blobItemContainer_.showRecent();
};


/**
 * Called when component's element is known to have been removed from the
 * document.
 */
camlistore.IndexPage.prototype.exitDocument = function() {
  camlistore.IndexPage.superClass_.exitDocument.call(this);
  // Clear event handlers here
};


/**
 * @param {Array.<camlistore.BlobItem>} blobItems Items to add to the permanode.
 * @private
 */
camlistore.IndexPage.prototype.createNewSetWithItems_ = function(blobItems) {
  this.connection_.createPermanode(
      goog.bind(this.createPermanodeDone_, this, blobItems));
};


/**
 * @param {Array.<camlistore.BlobItem>} blobItems Items to add to the permanode.
 * @param {string} permanode Node to add the items to.
 * @private
 */
camlistore.IndexPage.prototype.createPermanodeDone_ =
    function(blobItems, permanode) {
  var deferredList = [];
  var complete = goog.bind(this.addItemsToSetDone_, this, permanode);
  var callback = function() {
    deferredList.push(1);
    if (deferredList.length == blobItems.length + 1) {
      complete();
    }
  };

  this.connection_.newAddAttributeClaim(
        permanode, 'title', 'My new set', callback);
  goog.array.forEach(blobItems, function(blobItem, index) {
    this.connection_.newAddAttributeClaim(
        permanode, 'camliMember', blobItem.getBlobRef(), callback);
  }, this);
};


/**
 * @param {string} permanode Node to which the items were added.
 * @private
 */
camlistore.IndexPage.prototype.addItemsToSetDone_ = function(permanode) {
  this.blobItemContainer_.showRecent();
};
