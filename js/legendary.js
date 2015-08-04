var m_nSelectedLegendaryID = -1;
var m_cSelectedAccountToken;
var m_oItemlist;
var m_oItemBank = [];
var m_oLegendary = null;

$(function () {
	$('#shortlink').val('');

	var cSArgument = getParameterByName("s");
	if (cSArgument) {
		cSArgument = Base64.decode(cSArgument);
		m_nSelectedLegendaryID = parseInt(cSArgument.split(';')[0]);
		m_cSelectedAccountToken = cSArgument.split(';')[1];
		$.ajax({
			url: "json/itemlist.json"
		}).done(function (data) {
			m_oItemlist = data;
			showLegendaryRecipe();
			displayLegendaryRecipe();
		});
	} else {

		backToLegendarySelection();
		//Load Legendary selector
		loadLegendarySelector();
	}
});

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$('#create-shortlink').click(function () {
	var cLink = window.location.href.split("?")[0];
	var cContent = m_nSelectedLegendaryID + ";" + m_cSelectedAccountToken;
	var cShortlink = cLink + "?s=" + Base64.encode(cContent);

	document.getElementById('shortlink').value = cShortlink;

	$('#legendary-progressbar-messages').append('<div class="alert alert-warning alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Warning!</strong> Please remember that the shortlink contains your API-Key, so better think twice about sharing it!</div>');


    $('#shortlink').select();
});

$('#legendary-filter').on('input', function () {
	var cInput = $('#legendary-filter').val();
	$($('#legendary-selection-container').children()).each(function (key, value) {
		if (cInput) {
			if (!$(this).attr("data-name").toUpperCase().contains(cInput.toUpperCase())) {
				$(this).addClass("hidden");
			}
			else {
				$(this).removeClass("hidden");
			}
		}
		else {
			$(this).removeClass("hidden");
		}
	});
});

function loadLegendarySelector(params) {
	$.ajax({
		url: "json/itemlist.json"
	}).done(function (data) {
		m_oItemlist = data;

		$('#legendary-selection-container').html();
		$(m_oItemlist).each(function (key, element) {

			var cID = "legendary-item-" + element.ID;
			$('#legendary-selection-container').append(
				'<div id="' + cID + '" data-name="' + element.Name + '" class="col-md-3 item"></div>');
			$.ajax({
				url: 'https://api.guildwars2.com/v2/items?lang=en&ids=' + element.ID
			}).done(function (data) {
				var oItem = data[0];
				var cItemID = "item-" + oItem.id;
				var cImageID = "legendary-image-" + oItem.id;
				$('#' + cID).append('<a id="' + cItemID + '" href="javascript:void(0);" data-id="' + oItem.id + '"><img src="' + oItem.icon + '"  class="item-icon" /><span class="item-name">' + oItem.name + '</span><img class="legendary-background" id="' + cImageID + '" src="img/ingame/' + element.ID + '.jpg" alt=""></a>');	
			
				//Init clickevent
				$('a#' + cItemID).click(function () {
					selectLegendaryWeapon($(this).attr('data-id'));
				});
				
				$('#' + cImageID).load(function() {
					setLegendaryEffect("#" + cImageID);
				});

			});
		});

	});
}


function setLegendaryEffect(cItem) {
	var oAverageColor = $(cItem).averageColor();
	var cCssString = 'rgba(' + oAverageColor.r + ", " + oAverageColor.g + ", " + oAverageColor.b + ", .7)";
	$(cItem).css({
		"-webkit-box-shadow": " 0px 0px 15px 3px " + cCssString,
		"-moz-box-shadow": " 0px 0px 15px 3px " + cCssString,
		"box-shadow": " 0px 0px 15px 3px " + cCssString
	});
}

function selectLegendaryWeapon(nItemID) {
	$("#legendary-selection").animate({
		opacity: 0
	}, 250, function () {
		$('#legendary-selection-container').html();
		$("#legendary-selection").css({ "display": "none" });
		$("#account-selection").css({ "display": "block" });
		$("#account-selection").animate({
			opacity: 1
		}, 250);
	});
	m_nSelectedLegendaryID = nItemID;
	showAccounts();
}

function backToLegendarySelection() {
	$("#account-selection").animate({
		opacity: 0
	}, 250, function () {
		$('#account-selection-container').html();
		$("#account-selection").css({ "display": "none" });
		$("#legendary-selection").css({ "display": "block" });
		$("#legendary-selection").animate({
			opacity: 1
		}, 250);
	});
}

function backToAccountSelection() {

	$("#legendary-progress").animate({
		opacity: 0
	}, 250, function () {

		$("#legendary-progress").css({ "display": "none" });
		$("#account-selection").css({ "display": "block" });
		$("#account-selection").animate({
			opacity: 1
		}, 250);
		showAccounts();
	});
}
function showAccounts() {
	var oCookie = $.cookie('keylist');
	var nAddedKeys = 0;
	if (oCookie != undefined) {
		var cContent = Base64.decode(oCookie);
		var aKeys = cContent.split(';');

		$('#account-list').html('');

		$(aKeys).each(function (cKey, cValue) {
			if (cValue) {
				nAddedKeys++;
				var cID = "account-" + cValue;
				var cContainerID = newGuid();
				$('#account-list').append('<div id="' + cContainerID + '" class="list-group-item"><a href="javascript:void(0);" data-token="' + cValue + '"  id="' + cID + '"></a></div>');

				$.ajax({ url: "https://api.guildwars2.com/v2/account?access_token=" + cValue }).done(function (account) {
					$.ajax({ url: "https://api.guildwars2.com/v2/tokeninfo?access_token=" + cValue }).done(function (accesstoken) {
						$.ajax({ url: "https://api.guildwars2.com/v2/characters?access_token=" + cValue }).done(function (characters) {
							$('#' + cID).attr('data-ok', 1);
							$('#' + cID).append('<h4 class="list-group-item-heading">' + account.name + '  <small>' + accesstoken.name + "</small></h4>");
							$('#' + cID).append('<p class="list-group-item-text"><span class="glyphicon glyphicon-link"></span> ' + cValue + '</p>');
							$('#' + cID).append('<p class="list-group-item-text">');
							$('#' + cContainerID).append('<button type="button" class="btn btn-danger btn-xs pull-right" data-toggle="modal" data-target="#modal-delete-account" data-token="' + cValue + '" data-accountname="' + account.name + '" data-tokenname="' + accesstoken.name + '">Remove this account</button>');


							$(characters).each(function (cCharacterKey, cCharacter) {
								$('#' + cID).append('<span class="label label-default">' + cCharacter + '</span>')
							});
							$('#' + cID).append('</p>');
						}).fail(function () {
							$('#' + cID).append('An error occured during retrieving information about this account. Please try again later.');
						});
					}).fail(function () {
						$('#' + cID).append('An error occured during retrieving information about this token. Please try again later.');
					});
				}).fail(function () {
					$('#' + cID).append('An error occured during retrieving information about this account. Please try again later.');
				});

				$('#' + cID).click(function () {
					selectAccount($(this).attr('data-token'));
				});
			}
		});
	}
	if (nAddedKeys == 0) {
		$('#account-list').append('<div class="alert alert-info" role="alert">You have not added any accounts so far. Do so by inserting your <i>valid</i> APi-Key in the Box above.</div>');
	}
}

$('#modal-delete-account').on('show.bs.modal', function (event) {
	var button = $(event.relatedTarget) // Button that triggered the modal
 
	$('#modal-delete-account-submit').attr("data-token", button.attr("data-token"));
	$('#modal-delete-account-token').html(button.attr('data-token'));
	$('#modal-delete-account-tokenname').html(button.attr('data-tokenname'));
	$('#modal-delete-account-accountname').html(button.attr('data-accountname'));

})

$('#modal-delete-account-submit').click(function () {
	var aKeysInCookie;
	var oCookie = $.cookie('keylist');

	oCookie = Base64.decode(oCookie);
	aKeysInCookie = oCookie.split(';');

	var cToken = $(this).attr("data-token");
	aKeysInCookie = aKeysInCookie.filter(function (item) { return item !== cToken; });

	if ($.inArray(cToken, aKeysInCookie) == -1) {
		$.cookie('keylist', Base64.encode(aKeysInCookie.join(';')), { expires: 20000, path: '/' });
		
		//reload
		showAccounts();
	}
	$('#modal-delete-account').modal('hide');
});

$('#input-add-account').on('input', function () {
	var cKey = $(this).val();
	var cUrl = "https://api.guildwars2.com/v2/tokeninfo?access_token=" + cKey;
	if (checkKey(cKey)) {
		$.ajax({ url: cUrl }).done(function (data) {
			var nAccount = $.inArray('account', data.permissions);
			var nInventory = $.inArray('inventories', data.permissions);
			var nCharacter = $.inArray('characters', data.permissions);
			if (nAccount > -1 && nInventory > -1 && nCharacter > -1) {
				$('#container-add-account').removeClass("has-error");
				$('#container-add-account').addClass("has-success");
				$('#button-add-account').removeClass("disabled");

			}
			else {
				setAccountRequestError();
			}

		}).fail(function () {
			setAccountRequestError();
		});
	}
	else {
		setAccountRequestError();
	}
});

$('#button-add-account').click(function () {
	var cKey = $('#input-add-account').val();
	addAccount(cKey);

	$('#container-add-account').removeClass("has-success");
	$('#button-add-account').addClass("disabled");
	$('#input-add-account').val('');

});

function addAccount(cKey) {
	var aKeysInCookie;
	var oCookie = $.cookie('keylist');
	if (oCookie != undefined) {
		oCookie = Base64.decode(oCookie);
		aKeysInCookie = oCookie.split(';');
	}
	else {
		aKeysInCookie = Array();
	}

	if ($.inArray(cKey, aKeysInCookie) == -1) {
		aKeysInCookie.push(cKey);
		$.cookie('keylist', Base64.encode(aKeysInCookie.join(';')), { expires: 20000, path: '/' });
		
		//reload
		showAccounts();
	}
}

function setAccountRequestError() {
	if (!$('#container-add-account').hasClass("has-error")) {
		$('#container-add-account').addClass("has-error");
	}
	if (!$('#button-add-account').hasClass("disabled")) {
		$('#button-add-account').addClass("disabled");
	}
}

function checkKey(cKey) {
	if (cKey.length == 72) {
		if ((cKey.match(/-/g) || []).length == 8) {
			return true;
		}
	}
	return false;
}

function selectAccount(cToken) {
	m_cSelectedAccountToken = cToken;
	displayLegendaryRecipe();
}

function displayLegendaryRecipe() {
	if (m_nSelectedLegendaryID > -1 && m_cSelectedAccountToken) {

		$('#legendary-recipe').html('');
		$('#group-shortlink').addClass('hidden');
		
		$(m_oItemlist).each(function (key, value) {
			if (value.ID == m_nSelectedLegendaryID) {
				m_oLegendary = value;
			}
		});

		if (m_oLegendary != null) {
			setProgressbarLoading(0);
			setProgressbarLoadingVisibility(true);

			showLegendaryRecipe();
			$('#legendary-name-headline').html(m_oLegendary.Name);
			
			//Load Bank
			fillItemBank(function () {
				displayIngredients(m_oLegendary, 'legendary-recipe', false, function () {
					setProgressbarLoadingVisibility(false);
					
					//Sum
					var nSum = 0;
					$('#legendary-recipe .media').each(function () {
						if ($(this).attr("data-goldvalue")) {
							nSum += parseInt($(this).attr("data-goldvalue"));
						}
					});

					$('#legendary-recipe').append('<div class="media tree-sum"><div class="sum"><b>Total Gold:</b> ' + toGoldSilverCopper(nSum) + '</div></div>');
					
					//Link
					$('#group-shortlink').removeClass('hidden');
				});
			});
		}
	}
}

function fillItemBank(callback) {
	m_oItemBank = [];
	$.ajax({
		"url": "https://api.guildwars2.com/v2/account/bank?access_token=" + m_cSelectedAccountToken
	}).done(function (aBank) {
		$.ajax({
			"url": "https://api.guildwars2.com/v2/account/materials?access_token=" + m_cSelectedAccountToken
		}).done(function (aMaterials) {
			$.ajax({
				"url": "https://api.guildwars2.com/v2/characters?access_token=" + m_cSelectedAccountToken
			}).done(function (aCharacters) {
				$.ajax({
					"url": "https://api.guildwars2.com/v2/characters?access_token=" + m_cSelectedAccountToken + "&ids=" + aCharacters.join()
				}).done(function (aCharacterDetails) {
					$(aBank).each(function (key, value) {
						if (value != null) {
							if (!m_oItemBank["i" + value.id.toString()]) {
								m_oItemBank["i" + value.id.toString()] = 0;
							}
							m_oItemBank["i" + value.id.toString()] += value.count;
						}
					});
					$(aMaterials).each(function (key, value) {
						if (value != null) {
							if (!m_oItemBank["i" + value.id.toString()]) {
								m_oItemBank["i" + value.id.toString()] = 0;
							}
							m_oItemBank["i" + value.id.toString()] += value.count;
						}
					});
					$(aCharacterDetails).each(function (key, value) {
						if (value != null) {
							$(value.equipment).each(function (cKey, oValue) {
								if (oValue != null) {
									if (!m_oItemBank["i" + oValue.id.toString()]) {
										m_oItemBank["i" + oValue.id.toString()] = 0;
									}
									m_oItemBank["i" + oValue.id.toString()] += oValue.count;
								}
							});
							$(value.bags).each(function (cKey, oBag) {
								$(oBag.inventory).each(function (cKey, oInventorySlot) {
									if (oInventorySlot != null) {
										if (!m_oItemBank["i" + oInventorySlot.id.toString()]) {
											m_oItemBank["i" + oInventorySlot.id.toString()] = 0;
										}
										m_oItemBank["i" + oInventorySlot.id.toString()] += oInventorySlot.count;
									}
								});
							});
						}
					});

					callback();
				});
			});
		});
	});
}


function displayIngredients(oItem, cContainer, bParentIsFinished, callback) {
	if (oItem.Ingredients.length == 4) {

		var bIngredient0Finished = false;
		if (m_oItemBank["i" + oItem.Ingredients[0].ID] != undefined || bParentIsFinished) {
			if (m_oItemBank["i" + oItem.Ingredients[0].ID] >= oItem.Ingredients[0].Quantity || bParentIsFinished) {
				bIngredient0Finished = true;
			}
		}
		var bIngredient1Finished = false;
		if (m_oItemBank["i" + oItem.Ingredients[1].ID] != undefined || bParentIsFinished) {
			if (m_oItemBank["i" + oItem.Ingredients[1].ID] >= oItem.Ingredients[1].Quantity || bParentIsFinished) {
				bIngredient1Finished = true;
			}
		}
		var bIngredient2Finished = false;
		if (m_oItemBank["i" + oItem.Ingredients[2].ID] != undefined || bParentIsFinished) {
			if (m_oItemBank["i" + oItem.Ingredients[2].ID] >= oItem.Ingredients[2].Quantity || bParentIsFinished) {
				bIngredient2Finished = true;
			}
		}

		var bIngredient3Finished = false;
		if (m_oItemBank["i" + oItem.Ingredients[3].ID] != undefined || bParentIsFinished) {
			if (m_oItemBank["i" + oItem.Ingredients[3].ID] >= oItem.Ingredients[3].Quantity || bParentIsFinished) {
				bIngredient3Finished = true;
			}
		}


		displayItem(oItem.Ingredients[0], cContainer, bParentIsFinished, bIngredient0Finished, function () {
			//alert(oItem.Ingredients[0].Name);
			displayItem(oItem.Ingredients[1], cContainer, bParentIsFinished, bIngredient1Finished, function () {
				//alert(oItem.Ingredients[1].Name);
				displayItem(oItem.Ingredients[2], cContainer, bParentIsFinished, bIngredient2Finished, function () {
					//alert(oItem.Ingredients[2].Name);
					displayItem(oItem.Ingredients[3], cContainer, bParentIsFinished, bIngredient3Finished, function () {
						//alert(oItem.Ingredients[3].Name);
						callback();
					});
				});
			});
		});
	}
	else {
		callback();
	}
}

function displayItem(oItem, cContainer, bParentIsFinished, bItemFinished, callback) {
	var cID = oItem.ID + '-' + newGuid();
	var cClasses = "";
	var cCompletedTick = "";
	if (bItemFinished) {
		cClasses += "greyed-out ";
		cCompletedTick = '<div class="item-completed"><span class="glyphicon glyphicon-ok"></span></div>';
	}

	$('#' + cContainer).append('<div data-name="' + oItem.Name + '" class="media ' + cClasses + '" id="' + cID + '"></div>');

	$.ajax({
		"url": "https://api.guildwars2.com/v2/items?lang=en&ids=" + oItem.ID
	}).done(function (oApiItem) {
		oApiItem = oApiItem[0];
		oItem.Quantity = oItem.Quantity == 0 || oItem.Quantity == undefined ? 1 : oItem.Quantity;

		var cSubID = oItem.ID + '-' + newGuid() + "-body";
		var cDescription = oApiItem.description == undefined ? "" : oApiItem.description;
		
		var nProgressPercentage = 0;
		var nProgressTotal = 0;
		if (m_oItemBank["i" + oItem.ID] >= oItem.Quantity || bItemFinished) {
			nProgressPercentage = 100;
			nProgressTotal = oItem.Quantity;
		}
		else {
			nProgressPercentage = (m_oItemBank["i" + oItem.ID] / oItem.Quantity) * 100;
			nProgressTotal = m_oItemBank["i" + oItem.ID];
			if (nProgressTotal == undefined) {
				nProgressTotal = 0;
			}
		}
		if(!nProgressTotal){
			nProgressTotal = 0;
		}
		var cName = '<span class="ingredient-quantity">' + nProgressTotal + '</span><span class="ingredient-quantity-of">/' + oItem.Quantity + '</span> <span class="ingredient-quantity-x">&times;</span> ' + oApiItem.name;

		if(!bParentIsFinished){
			m_oItemBank["i" + oItem.ID] = m_oItemBank["i" + oItem.ID] - nProgressTotal;
		
		}
			

		var cProgressProgressbar = '<div class="progress pull-right"><div class="progress-bar  ' + (nProgressPercentage == 100 || bItemFinished ? "progress-bar-success" : "") + ' progress-bar-striped" role="progressbar" style="width: ' + nProgressPercentage + '%;"></div></div>';
		var cPrice;
		
		var cTooltipID = newGuid();
		$.ajax({
			"url": "https://api.guildwars2.com/v2/commerce/prices?ids=" + oItem.ID
		}).done(function (aPrices) {
			var oPrice = aPrices[0];
			var nPrice = oPrice.sells.unit_price * (oItem.Quantity - nProgressTotal);
			cPrice = '<div data-toggle="tooltip" id="' + cTooltipID + '" title="' + toGoldSilverCopper(oPrice.sells.unit_price) + ' each <span class=\'times\'>&times;</span> ' + (oItem.Quantity - nProgressTotal) + '" class="item-cost pull-right">' + toGoldSilverCopper(nPrice) + '</div>';

			$('#' + cID).attr("data-goldvalue", nPrice);

		}).fail(function () {
			if (oItem.Method == "Purchase" || oItem.Method == null) {
				switch (oItem.ID) {
					case 19925:
						//Obsidian Shard
						cPrice = '<div class="item-cost pull-right"><span class="currency karma">Karma</span></div>';
						break;

					case 20796:
					case 20799:
					case 20797:
						//Philisophers stone / Crystal / bloodst. shard
						cPrice = '<div class="item-cost pull-right"><span class="currency spiritshard">Spirit Shards</span></div>';
						break;

					case 19676:
						//Runestone
						var nPrice = 10000 * (oItem.Quantity - nProgressTotal);
							cPrice = '<div data-toggle="tooltip" id="' + cTooltipID + '" title="' + toGoldSilverCopper(10000) + ' each <span class=\'times\'>&times;</span> ' + (oItem.Quantity - nProgressTotal) + '" class="item-cost pull-right">' + toGoldSilverCopper(nPrice) + ' <span class="currency merchant">Merchant</span></div>';

						
						break;

					case 19678:
						//Gift of battle
						cPrice = '<div class="item-cost pull-right"><span class="currency badges">Badges of Honor</span></div>';
						break;
					case 20000:
						cPrice = '<div class="item-cost pull-right"><span class="currency diamonds">Diamonds</span></div>';
						break;
					default:
						cPrice = "";
						break;
				}
			} else if (oItem.Method == "World Completion") {
				cPrice = '<div class="item-cost pull-right"><span class="currency worldcompletion">World Completion</span></div>';
			} else if (oItem.Method == "Mystic Forge") {
				cPrice = '<div class="item-cost pull-right"><span class="currency mysticforge">Mystic Forge</span></div>';
			} else if (oItem.Method == "Craft") {
				cPrice = '<div class="item-cost pull-right"><span class="currency crafting">Crafting</span></div>';
			}
		}).always(function () {
			var nToGo = (oItem.Quantity - nProgressTotal);
			var cToGo = nToGo != 0 ? '<span class="label label-primary">' +nToGo + " to go</span>" : '<span class="label label-success">done!</span>'; 

			var cItemDetails = '<div class="item-details"><div class="item-quantities pull-right">' + cToGo + '</div>' + cProgressProgressbar + cPrice + '</div>'

			$('#' + cID).append('<div class="media-left"><img class="media-object rarity-' + oApiItem.rarity + '" src="' + oApiItem.icon + '" alt="' + oApiItem.name + '" />' + cCompletedTick + '</div><div class="media-body" id="' + cSubID + '"><div class="legendary-recipe-item-body"><h4 class="media-heading">' + cName + ' <a href="http://wiki.guildwars2.com/index.php?title=' + oApiItem.name + '" title="Open the wiki article"><span class="glyphicon glyphicon-info-sign"></span></a> <a href="http://www.gw2spidy.com/item/' + oItem.ID + '" title="Show on GW2Spidy.com"><span class="glyphicon glyphicon-shopping-cart"></span></a></h4> ' + cDescription + cItemDetails + '</div></div>');

			$('#' + cTooltipID).tooltip({
				"html": true,
				"container": 'body'
			});

			displayIngredients(oItem, cSubID, bItemFinished, function () {
				increaseProgressbarLoading();
				callback();
			});
		});
	});

}


function toGoldSilverCopper(nValue) {

	var cGoldTagOpen = "<span class='currency gold'>";
	var cSilverTagOpen = "<span class='currency silver'>";
	var cCopperTagOpen = "<span class='currency copper'>";
	var cGoldTagClose = '</span>';
	var cSilverTagClose = '</span>';
	var nSign = (nValue < 0 ? -1 : 1);
	var cCopperTagClose = '</span>';

	var nGold = Math.floor(nSign * nValue / 10000);
	var nSilver = Math.floor((nSign * nValue - nGold * 10000) / 100);
	var nCopper = nSign * nValue - nGold * 10000 - nSilver * 100;


	if (nGold)
		return cGoldTagOpen + (nSign * nGold) + cGoldTagClose +
			cSilverTagOpen + nSilver + cSilverTagClose +
			cCopperTagOpen + nCopper + cCopperTagClose;
	if (nSilver)
		return cSilverTagOpen + (nSign * nSilver) + cSilverTagClose +
			cCopperTagOpen + nCopper + cCopperTagClose;
	if (nCopper)
		return cCopperTagOpen + (nSign * nCopper) + cCopperTagClose;

	return cCopperTagOpen + "0" + cCopperTagClose;
}

function setProgressbarLoading(nValue) {
	$('#legendary-progressbar-loading-progress').css('width', (nValue * ( 100 /m_oLegendary.IngredientCount)) + '%');
	$('#legendary-progressbar-loading-progress').attr('data-current', nValue);
}

function increaseProgressbarLoading() {
	var nCurrValue = parseInt($('#legendary-progressbar-loading-progress').attr('data-current'));
	setProgressbarLoading(nCurrValue + 1);
}

function setProgressbarLoadingVisibility(bVisible) {
	if (bVisible) {
		$('#legendary-progressbar-loading').removeClass("hidden");
	}
	else {
		$('#legendary-progressbar-loading').addClass("hidden");
	}
}

function showLegendaryRecipe() {
	$("#account-selection").animate({
		opacity: 0
	}, 250, function () {
		$("#account-selection").css({ "display": "none" });
		$("#legendary-progress").css({ "display": "block" });
		$("#legendary-progress").animate({
			opacity: 1
		}, 250);
	});
}

function newGuid() {
	return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}

function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}


var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/\r\n/g, "\n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }