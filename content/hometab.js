/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Home Tab.
 *
 * The Initial Developer of the Original Code is
 * Blake Winton.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

function addCategories(data) {
  let categories = $("#categories").html("");
  let firstCategory = null;
  for (let index in data) {
    let record = data[index];
    let category = $("<li class='category'></li>");
    category.text(record.folder);
    category.attr("id", record.id);
    categories.append(category);
    if (index == 0)
      firstCategory = category;
  }
  updateTab({"target":firstCategory});
}

function clearContent() {
  $("#preview").html("");
}

function getSpan(id, data) {
  let retval = $("<span class='"+id+"'/>");
  retval.text(""+data[id]);
  return retval;
}

function setFolders(folders) {
  clearContent();
  let content = $("<ol class='folders'/>").appendTo($("#preview"));
  for (let index in folders) {
    let folder = folders[index];
    let li = $("<li class='folder'/>");
    li.addClass((folder.unread > 0) ? "unread" : "read");
    li.attr("id", folder.id);
    li.append($("<span class='name'/>").text(folder.name + " "));
    if (folder.unread > 0) {
      li.append($("<span class='count'/>").text(folder.unread));
    }
    content.append(li);
    li.bind("click", function (e) {showConversations($(this))});
  }
}

 //XXX I'm sorry for ever writing this function
function htmlEscape(text) {
  return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&rt;");
}

function addContent(data) {
  let conversations = $("ol.conversations");
  if (conversations.length == 0) {
    conversations = $('<ol class="conversations"></ol>').appendTo($("#preview"))
  }

  let entry = $('<li class="conversation"></li>').appendTo(conversations);
  entry.addClass(("unread" in data && data["unread"].length > 0) ? "unread" : "read");
  entry.attr("id", data["id"]);

  if ("subject" in data) {
    entry.append($('<div class="subject">' + htmlEscape(data["subject"]) + '</div>'));
  }

  let messages = $('<ol class="messages"></ol>').appendTo(entry);

  for (let unread in data["unread"]) {
    let msg = $('<li class="message unread"></li>').appendTo(messages);
    msg.append($('<span class="from">' + data["unread"][unread].from.value + '</span>'));
    msg.append($('<span class="date">' + data["unread"][unread].date + '</span>'));
    msg.append($('<div class="body">' + htmlEscape(data["unread"][unread].indexedBodyText.substr(0, 140)) + '</div>'));
  }

  for (let read in data["messages"]) {
    let msg = $('<li class="message read"></li>').appendTo(messages);
    msg.append($('<span class="from">' + data["messages"][read].from.value + '</span>'));
    msg.append($('<span class="date">' + data["messages"][read].date + '</span>'));
    msg.append($('<span class="body">' + htmlEscape(data["messages"][read].indexedBodyText.substr(0, 140)) + '</span>'));
  }
  entry.bind("click", function (e) {showMessages($(this))});
}

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

/**
 * addEventListener betrayals compel us to establish our link with the
 *  outside world from inside.  NeilAway suggests the problem might have
 *  been the registration of the listener prior to initiating the load.  Which
 *  is odd considering it works for the XUL case, but I could see how that might
 *  differ.  Anywho, this works for now and is a delightful reference to boot.
 */
var aTab;
function reachOutAndTouchFrame() {
  let us = window.QueryInterface(Ci.nsIInterfaceRequestor)
                 .getInterface(Ci.nsIWebNavigation)
                 .QueryInterface(Ci.nsIDocShellTreeItem);

  let parentWin = us.parent
                    .QueryInterface(Ci.nsIInterfaceRequestor)
                    .getInterface(Ci.nsIDOMWindow);
  aTab = parentWin.tab;
  parentWin.tab = null;
  aTab.htmlLoadHandler(this);
}

function updateTab(e) {
  let element = $(e.target);
  $("#categories > .category[selected='true']").removeAttr("selected");
  element.attr("selected", "true");
  $("#preview").html("Clicked on tab "+element.attr("id"));
  aTab.showFolders(this, element.attr("id"));
}

function showConversations(element) {
  aTab.showConversations(this, element.attr("id"));
}

function showMessages(element) {
  aTab.showMessages(this, element.attr("id"));
}
