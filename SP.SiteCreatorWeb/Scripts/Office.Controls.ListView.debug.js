/* Office Web Widgets - Experimental */
/* Version: 0.1 */
/*
	Copyright (c) Microsoft Corporation.  All rights reserved.
*/

/*
	Your use of this file is governed by the following license http://go.microsoft.com/fwlink/?LinkId=392925
*/
if (window.Type && window.Type.registerNamespace) {
    Type.registerNamespace('Office.Controls');
}
else {
    if (typeof window['Office'] == 'undefined') {
        window['Office'] = new Object();
        window['Office'].__namespace = true;
    }
    if (typeof window['Office']['Controls'] == 'undefined') {
        window['Office']['Controls'] = new Object();
        window['Office']['Controls'].__namespace = true;
    }
}
Office.Controls.ListView = function Office_Controls_ListView(root, parameterObject) {
    if (typeof root !== 'object' || typeof parameterObject !== 'object') {
        Office.Controls.Utils.errorConsole('Invalid parameters type');
        return;
    }
    this._onLoad$p$0 = parameterObject.onload;
    if (Office.Controls.Utils.isNullOrUndefined(this._onLoad$p$0)) {
        this._onLoad$p$0 = Office.Controls.Utils.NOP;
    }
    this._root$p$0 = root;
    if (Office.Controls.Utils.isNullOrEmptyString(parameterObject.listUrl)) {
        Office.Controls.Utils.errorConsole('No list URL specified');
        return;
    }
    this._separateListUrl$p$0(parameterObject.listUrl);
    this._viewID$p$0 = parameterObject.viewID;
    if (Office.Controls.Utils.isNullOrEmptyString(ListView.ImageBasePath)) {
        ListView.ImageBasePath = Office.Controls.Runtime.context.appWebUrl;
    }
    this._render$p$0();
};
Office.Controls.ListView._getWPQ$p = function Office_Controls_ListView$_getWPQ$p(count) {
    return Office.Controls.ListView._wpqPrefix$p + count.toString();
};
Office.Controls.ListView._getListViewPreTemplate$p = function Office_Controls_ListView$_getListViewPreTemplate$p(count) {
    return '<div id=\"script' + Office.Controls.ListView._getWPQ$p(count) + '\" class=\"office office-listview\"></div>' + '<div id=\"scriptPaging' + Office.Controls.ListView._getWPQ$p(count) + '\" class=\"office office-listview\"></div>';
};
Office.Controls.ListView._createBasicRequestInfo$p = function Office_Controls_ListView$_createBasicRequestInfo$p() {
    var requestInfos = new SP.RequestInfo();

    requestInfos.headers = {};
    requestInfos.headers['Accept'] = Office.Controls.Utils.oDataJSONAcceptString;
    requestInfos.method = 'POST';
    requestInfos.error = function(infos, code, errorMessage) {
        Office.Controls.Utils.errorConsole('Error trying to reach the server : ' + errorMessage);
    };
    return requestInfos;
};
Office.Controls.ListView.create = function Office_Controls_ListView$create(root, parameterObject) {
    return new Office.Controls.ListView(root, parameterObject);
};
Office.Controls.ListView.prototype = {
    _listViewId$p$0: 0,
    _root$p$0: null,
    _pathToList$p$0: null,
    _listHost$p$0: null,
    _viewID$p$0: null,
    _onLoad$p$0: null,
    _getInstanceWPQ$p$0: function Office_Controls_ListView$_getInstanceWPQ$p$0() {
        return Office.Controls.ListView._getWPQ$p(this._listViewId$p$0);
    },
    _separateListUrl$p$0: function Office_Controls_ListView$_separateListUrl$p$0(listUrl) {
        var urlParts = listUrl.split('/_api/');

        if (urlParts.length === 1) {
            urlParts = listUrl.split('/_vti_bin/client.svc/');
        }
        this._listHost$p$0 = urlParts[0];
        this._pathToList$p$0 = urlParts[1];
    },
    _render$p$0: function Office_Controls_ListView$_render$p$0() {
        Office.Controls.ListView._listViewCount$p += 1;
        this._listViewId$p$0 = Office.Controls.ListView._listViewCount$p;
        this._root$p$0.innerHTML = Office.Controls.ListView._getListViewPreTemplate$p(this._listViewId$p$0);
        if (Office.Controls.Utils.isNullOrEmptyString(this._viewID$p$0)) {
            var $$t_0 = this;

            this._getDefaultViewId$p$0(function() {
                $$t_0._getListData$p$0();
            });
        }
        else {
            this._getListData$p$0();
        }
    },
    _getListData$p$0: function Office_Controls_ListView$_getListData$p$0() {
        var requestExecutor = Office.Controls.Runtime.context.getRequestExecutor();
        var requestInfos = Office.Controls.ListView._createBasicRequestInfo$p();

        requestInfos.headers['Content-Type'] = Office.Controls.Utils.oDataJSONAcceptString;
        requestInfos.headers[Office.Controls.Utils.clientTagHeaderName] = 'ClientControls-ListView';
        var $$t_E = this;

        requestInfos.success = function(infos) {
            if (infos.statusCode === 200) {
                var context = Office.Controls.Utils.deserializeJSON(infos.body);

                context.wpq = $$t_E._getInstanceWPQ$p$0();
                var currentRoot = context.HttpRoot;
                var index = currentRoot.indexOf('://');

                index = currentRoot.indexOf('/', index + 3);
                var appweb = Office.Controls.Runtime.context.appWebUrl;
                var i2 = appweb.indexOf('://');

                i2 = appweb.indexOf('/', i2 + 3);
                var hostweb = Office.Controls.Runtime.context.sharePointHostUrl;
                var i3 = hostweb.indexOf('://');

                i3 = hostweb.indexOf('/', i3 + 3);
                var currentPath = currentRoot.substring(index, currentRoot.length);
                var userDispUrl = context.ListSchema.UserDispUrl;

                if (Office.Controls.Utils.isNullOrUndefined(userDispUrl)) {
                    userDispUrl = '';
                }
                context.ListSchema.UserDispUrl = userDispUrl.replace(currentPath, '');
                context.ListSchema.serverUrl = hostweb.substring(0, i3);
                context.HttpRoot = appweb.substring(0, i2) + currentPath;
                RenderListView(context, $$t_E._getInstanceWPQ$p$0());
                $$t_E._onLoad$p$0();
            }
            else {
                Office.Controls.Utils.errorConsole('Bad error code returned by the server : ' + infos.statusCode.toString());
            }
        };
        requestInfos.body = '{\'parameters\': {\'__metadata\': { \'type\': \'SP.RenderListDataParameters\' }, \'ViewXml\': \'\', \'RenderOptions\' : \'7\'}}';
        requestInfos.url = '_api/SP.AppContextSite(@target)/' + this._pathToList$p$0 + '/RenderListDataAsStream?View=\'' + this._viewID$p$0 + '\'&@target=\'' + this._listHost$p$0 + '\'';
        var rootFolder = Office.Controls.Utils.getQueryStringParameter('RootFolder');

        if (!Office.Controls.Utils.isNullOrEmptyString(rootFolder)) {
            requestInfos.url += '&rootFolder=' + rootFolder;
        }
        var folderCTID = Office.Controls.Utils.getQueryStringParameter('FolderCTID');

        if (!Office.Controls.Utils.isNullOrEmptyString(folderCTID)) {
            requestInfos.url += '&folderCTID=' + folderCTID;
        }
        requestExecutor.executeAsync(requestInfos);
    },
    _getDefaultViewId$p$0: function Office_Controls_ListView$_getDefaultViewId$p$0(cb) {
        var requestExecutor = Office.Controls.Runtime.context.getRequestExecutor();
        var requestInfos = Office.Controls.ListView._createBasicRequestInfo$p();

        requestInfos.headers[Office.Controls.Utils.clientTagHeaderName] = 'ClientControls-ListView';
        var $$t_5 = this;

        requestInfos.success = function(infos) {
            if (infos.statusCode === 200) {
                var response = Office.Controls.Utils.deserializeJSON(infos.body);

                $$t_5._viewID$p$0 = response.d.Id;
                cb();
            }
            else {
                Office.Controls.Utils.errorConsole('Bad error code returned by the server : ' + infos.statusCode.toString());
            }
        };
        requestInfos.url = '_api/SP.AppContextSite(@target)/' + this._pathToList$p$0 + '/DefaultView/Id?@target=\'' + this._listHost$p$0 + '\'';
        requestExecutor.executeAsync(requestInfos);
    }
};
Office.Controls.ListView.Parameters = function Office_Controls_ListView_Parameters() {
};
Office.Controls.ListView.ListViewXHR = function Office_Controls_ListView_ListViewXHR() {
    var url = Office.Controls.Runtime.context.appWebUrl;

    this._requestInfo$p$0 = new SP.RequestInfo();
    this._requestInfo$p$0.headers = {};
    var $$t_5 = this;

    this._requestInfo$p$0.success = function(responseInfo) {
        $$t_5._onSuccess$p$0(responseInfo);
    };
    var $$t_6 = this;

    this._requestInfo$p$0.error = function(responseInfo, errorCode, errorMessage) {
        $$t_6._onError$p$0(responseInfo, errorCode, errorMessage);
    };
    this.readyState = Office.Controls.ListView.ListViewXHR.UNSENT;
    this.status = 0;
    this.statusText = '';
    this.response = '';
    this.responseText = '';
    this.timeout = 0;
    this._re$p$0 = new SP.RequestExecutor(url);
};
Office.Controls.ListView.ListViewXHR.prototype = {
    _re$p$0: null,
    _requestInfo$p$0: null,
    _responseInfo$p$0: null,
    open: function Office_Controls_ListView_ListViewXHR$open(method, url) {
        this._requestInfo$p$0.method = method;
        this._requestInfo$p$0.url = url;
    },
    setRequestHeader: function Office_Controls_ListView_ListViewXHR$setRequestHeader(header, value) {
        if (Office.Controls.Utils.isNullOrUndefined(this._requestInfo$p$0.headers[header])) {
            this._requestInfo$p$0.headers[header] = value;
        }
        else {
            this._requestInfo$p$0.headers[header] += ' ' + value;
        }
    },
    send: function Office_Controls_ListView_ListViewXHR$send(body) {
        this._requestInfo$p$0.body = body;
        if (this.timeout) {
            this._requestInfo$p$0.timeout = this.timeout;
        }
        this._re$p$0.executeAsync(this._requestInfo$p$0);
        this.readyState = Office.Controls.ListView.ListViewXHR.OPENED;
        this._callReadyState$p$0();
    },
    getResponseHeader: function Office_Controls_ListView_ListViewXHR$getResponseHeader(header) {
        if (this.readyState === Office.Controls.ListView.ListViewXHR.UNSENT || this.readyState === Office.Controls.ListView.ListViewXHR.OPENED) {
            return null;
        }
        return this._responseInfo$p$0.headers[header.toUpperCase()].toString();
    },
    getAllResponseHeaders: function Office_Controls_ListView_ListViewXHR$getAllResponseHeaders() {
        if (this.readyState === Office.Controls.ListView.ListViewXHR.UNSENT || this.readyState === Office.Controls.ListView.ListViewXHR.OPENED) {
            return null;
        }
        return this._responseInfo$p$0.allResponseHeaders;
    },
    _onSuccess$p$0: function Office_Controls_ListView_ListViewXHR$_onSuccess$p$0(responseInfo) {
        this._onAlways$p$0(responseInfo);
    },
    _onError$p$0: function Office_Controls_ListView_ListViewXHR$_onError$p$0(responseInfo, errorCode, errorMessage) {
        this._onAlways$p$0(responseInfo);
    },
    _callReadyState$p$0: function Office_Controls_ListView_ListViewXHR$_callReadyState$p$0() {
        if (this.onreadystatechange) {
            this.onreadystatechange();
        }
    },
    _onAlways$p$0: function Office_Controls_ListView_ListViewXHR$_onAlways$p$0(responseInfo) {
        this.status = responseInfo.statusCode;
        this.statusText = responseInfo.statusText;
        this.response = responseInfo.body;
        this.responseText = responseInfo.body;
        this._responseInfo$p$0 = responseInfo;
        this.readyState = Office.Controls.ListView.ListViewXHR.DONE;
        this._callReadyState$p$0();
    },
    readyState: 0,
    timeout: 0,
    status: 0,
    statusText: null,
    response: null,
    responseText: null,
    onreadystatechange: null
};
if (Office.Controls.ListView.registerClass)
    Office.Controls.ListView.registerClass('Office.Controls.ListView');
if (Office.Controls.ListView.Parameters.registerClass)
    Office.Controls.ListView.Parameters.registerClass('Office.Controls.ListView.Parameters');
if (Office.Controls.ListView.ListViewXHR.registerClass)
    Office.Controls.ListView.ListViewXHR.registerClass('Office.Controls.ListView.ListViewXHR');
Office.Controls.ListView._wpqPrefix$p = 'Listview';
Office.Controls.ListView._listViewCount$p = 0;
Office.Controls.ListView.ListViewXHR.UNSENT = 0;
Office.Controls.ListView.ListViewXHR.OPENED = 1;
Office.Controls.ListView.ListViewXHR.DONE = 4;
function $_global_listview() {
    {
        if ("undefined" == typeof g_all_modules) {
            g_all_modules = {};
        }
        g_all_modules["listview.js"] = {
            "version": {
                "rmj": 16,
                "rmm": 0,
                "rup": 2605,
                "rpr": 3001
            }
        };
    }
    if (typeof window["ListView"] == "undefined") {
        window["ListView"] = new Object();
    }
    if (typeof window["ListView"]["ImageBasePath"] == "undefined") {
        window["ListView"]["ImageBasePath"] = "";
    }
    (function(module) {
        var console;
        var ListViewDefaults = {};

        ListViewDefaults.Strings = {};
        ListViewDefaults.Strings.L_STSRecycleConfirm_Text = "Are you sure you want to send the item(s) to the site Recycle Bin?";
        ListViewDefaults.Strings.L_STSDelConfirm_Text = "Are you sure you want to permanently delete the item(s)?";
        ListViewDefaults.Strings.L_STSDelConfirmParentTask = "Deleting a summary task will also delete its subtasks.";
        ListViewDefaults.Strings.L_Notification_Delete = "Deleting...";
        ListViewDefaults.Strings.L_Notification_CheckOut = "Checking Out...";
        ListViewDefaults.Strings.L_NewDocumentCalloutSize = "280";
        ListViewDefaults.Strings.L_NewDocumentWordImgAlt = "Create a new Word document";
        ListViewDefaults.Strings.L_NewDocumentWord = "Word document";
        ListViewDefaults.Strings.L_NewDocumentExcelImgAlt = "Create a new Excel workbook";
        ListViewDefaults.Strings.L_NewDocumentExcel = "Excel workbook";
        ListViewDefaults.Strings.L_NewDocumentPowerPointImgAlt = "Create a new PowerPoint presentation";
        ListViewDefaults.Strings.L_NewDocumentPowerPoint = "PowerPoint presentation";
        ListViewDefaults.Strings.L_NewDocumentOneNoteImgAlt = "Create a new OneNote notebook";
        ListViewDefaults.Strings.L_NewDocumentOneNote = "OneNote notebook";
        ListViewDefaults.Strings.L_NewDocumentExcelFormImgAlt = "Create a new Excel survey";
        ListViewDefaults.Strings.L_NewDocumentExcelForm = "Excel survey";
        ListViewDefaults.Strings.L_NewDocumentFolderImgAlt = "Create a new folder";
        ListViewDefaults.Strings.L_NewDocumentFolder = "New folder";
        ListViewDefaults.Strings.L_SPStopEditingTitle = "Stop editing and save changes.";
        ListViewDefaults.Strings.L_SPStopEditingList = "{0}Stop{1} editing this list";
        ListViewDefaults.Strings.L_SPAddNewItem = "new item";
        ListViewDefaults.Strings.L_SPAddNewAnnouncement = "new announcement";
        ListViewDefaults.Strings.L_SPAddNewDocument = "new document";
        ListViewDefaults.Strings.L_SPAddNewLink = "new link";
        ListViewDefaults.Strings.L_SPAddNewEvent = "new event";
        ListViewDefaults.Strings.L_SPAddNewTask = "new task";
        ListViewDefaults.Strings.L_SPAddNewPicture = "new picture";
        ListViewDefaults.Strings.L_SPAddNewWiki = "new Wiki page";
        ListViewDefaults.Strings.L_SPAddNewDevApp = "new app to deploy";
        ListViewDefaults.Strings.L_SPAddNewApp = "new app";
        ListViewDefaults.Strings.L_SPAddNewItemTitle = "Add a new item to this list or library.";
        ListViewDefaults.Strings.L_SPAddNewAndDrag = "{0} or drag files here";
        ListViewDefaults.Strings.L_SPAddNewAndEdit = "{0} or {1}edit{2} this list";
        ListViewDefaults.Strings.L_SPEditListTitle = "Edit this list using Quick Edit mode.";
        ListViewDefaults.Strings.L_ViewSelectorCurrentView = "Current View";
        ListViewDefaults.Strings.L_SaveThisViewButton = "Save This View";
        ListViewDefaults.Strings.L_SPCount = "Count";
        ListViewDefaults.Strings.L_SPSum = "Sum";
        ListViewDefaults.Strings.L_SPAvg = "Average";
        ListViewDefaults.Strings.L_SPMax = "Maximum";
        ListViewDefaults.Strings.L_SPMin = "Minimum";
        ListViewDefaults.Strings.L_SPStdev = "Std Deviation";
        ListViewDefaults.Strings.L_SPVar = "Variance";
        ListViewDefaults.Strings.L_SPCollapse = "collapse";
        ListViewDefaults.Strings.L_SPExpand = "expand";
        ListViewDefaults.Strings.L_SPClientNoTitle = "No Title";
        ListViewDefaults.Strings.L_OpenMenu = "Open Menu";
        ListViewDefaults.Strings.L_select_deselect_all = "Select or deselect all items";
        ListViewDefaults.Strings.L_SPSelection_Checkbox = "Selection Checkbox";
        ListViewDefaults.Strings.L_OpenMenuKeyAccessible = "Click to sort column";
        ListViewDefaults.Strings.L_CSR_NoSortFilter = "This column type can\u0027t be sorted or filtered.";
        ListViewDefaults.Strings.L_NODOCSEARCH = "Your search returned no results.";
        ListViewDefaults.Strings.L_NODOC = "There are no files in the view \"%0\".";
        ListViewDefaults.Strings.L_NODOCView = "There are no documents in this view.";
        ListViewDefaults.Strings.L_AccRqEmptyView = "You are all up to date! There are no requests pending.";
        ListViewDefaults.Strings.L_SPClientPrevious = "Previous";
        ListViewDefaults.Strings.L_SPClientNext = "Next";
        ListViewDefaults.Strings.L_OpenMenu_Text = "Open Menu";
        ListViewDefaults.Strings.L_ViewSelectorTitle = "Change View";
        ListViewDefaults.Strings.L_SelectBackColorKey_TEXT = "W";
        ListViewDefaults.Strings.L_SlideShowPrevButton_Text = "Previous";
        ListViewDefaults.Strings.L_SlideShowNextButton_Text = "Next";
        ListViewDefaults.Strings.L_SPClientNew = "new";
        ListViewDefaults.Strings.L_SPClientNewAK = "n";
        ListViewDefaults.Strings.L_SPClientNewTooltip = "Create a new document in this library.";
        ListViewDefaults.Strings.L_ImgAlt_Text = "Picture";
        ListViewDefaults.Strings.L_SPClientEdit = "edit";
        ListViewDefaults.Strings.L_SPClientEditAK = "e";
        ListViewDefaults.Strings.L_SPClientEditTooltip = "Open a selected document for editing.";
        ListViewDefaults.Strings.L_SPClientUpload = "upload";
        ListViewDefaults.Strings.L_SPClientUploadAK = "u";
        ListViewDefaults.Strings.L_SPClientUploadTooltip = "Upload a document from your computer to this library.";
        ListViewDefaults.Strings.L_SPClientShare = "share";
        ListViewDefaults.Strings.L_SPClientShareAK = "s";
        ListViewDefaults.Strings.L_SPClientShareTooltip = "Invite people to a selected document or folder.";
        ListViewDefaults.Strings.L_SPClientManage = "manage";
        ListViewDefaults.Strings.L_SPClientManageAK = "m";
        ListViewDefaults.Strings.L_SPClientManageTooltip = "Do other activities with selected documents or folders.";
        ListViewDefaults.Strings.L_SPClientSync = "sync";
        ListViewDefaults.Strings.L_SPClientSyncAK = "y";
        ListViewDefaults.Strings.L_SPClientSyncTooltip = "Create a synchronized copy of this library on your computer.";
        ListViewDefaults.Strings.L_SPClientNumComments = "Number of Comment(s)";
        ListViewDefaults.Strings.L_SPEmailPostLink = "Email Post Link";
        ListViewDefaults.Strings.L_SPSelected = "Selected";
        ListViewDefaults.Strings.L_SPGroupBoardTimeCardSettingsNotFlex = "Normal";
        ListViewDefaults.Strings.L_SPView_Response = "View Response";
        ListViewDefaults.Strings.L_SPYes = "Yes";
        ListViewDefaults.Strings.L_SPNo = "No";
        ListViewDefaults.Strings.L_SPRelink = "Relink";
        ListViewDefaults.Strings.L_SPMerge = "Merge";
        ListViewDefaults.Strings.L_SPMeetingWorkSpace = "Meeting Workspace";
        ListViewDefaults.Strings.L_BusinessDataField_Blank = "(Blank)";
        ListViewDefaults.Strings.L_BusinessDataField_ActionMenuLoadingMessage = "Loading...";
        ListViewDefaults.Strings.L_BusinessDataField_ActionMenuAltText = "Actions Menu";
        ListViewDefaults.Strings.L_RelativeDateTime_AFewSecondsFuture = "In a few seconds";
        ListViewDefaults.Strings.L_RelativeDateTime_AFewSeconds = "A few seconds ago";
        ListViewDefaults.Strings.L_RelativeDateTime_AboutAMinuteFuture = "In about a minute";
        ListViewDefaults.Strings.L_RelativeDateTime_AboutAMinute = "About a minute ago";
        ListViewDefaults.Strings.L_RelativeDateTime_XMinutesFuture = "In {0} minute||In {0} minutes";
        ListViewDefaults.Strings.L_RelativeDateTime_XMinutes = "{0} minute ago||{0} minutes ago";
        ListViewDefaults.Strings.L_RelativeDateTime_XMinutesFutureIntervals = "1||2-";
        ListViewDefaults.Strings.L_RelativeDateTime_XMinutesIntervals = "1||2-";
        ListViewDefaults.Strings.L_RelativeDateTime_AboutAnHourFuture = "In about an hour";
        ListViewDefaults.Strings.L_RelativeDateTime_AboutAnHour = "About an hour ago";
        ListViewDefaults.Strings.L_RelativeDateTime_Tomorrow = "Tomorrow";
        ListViewDefaults.Strings.L_RelativeDateTime_Yesterday = "Yesterday";
        ListViewDefaults.Strings.L_RelativeDateTime_TomorrowAndTime = "Tomorrow at {0}";
        ListViewDefaults.Strings.L_RelativeDateTime_YesterdayAndTime = "Yesterday at {0}";
        ListViewDefaults.Strings.L_RelativeDateTime_XHoursFuture = "In {0} hour||In {0} hours";
        ListViewDefaults.Strings.L_RelativeDateTime_XHours = "{0} hour ago||{0} hours ago";
        ListViewDefaults.Strings.L_RelativeDateTime_XHoursFutureIntervals = "1||2-";
        ListViewDefaults.Strings.L_RelativeDateTime_XHoursIntervals = "1||2-";
        ListViewDefaults.Strings.L_RelativeDateTime_DayAndTime = "{0} at {1}";
        ListViewDefaults.Strings.L_RelativeDateTime_XDaysFuture = "{0} day from now||{0} days from now";
        ListViewDefaults.Strings.L_RelativeDateTime_XDays = "{0} day ago||{0} days ago";
        ListViewDefaults.Strings.L_RelativeDateTime_XDaysFutureIntervals = "1||2-";
        ListViewDefaults.Strings.L_RelativeDateTime_XDaysIntervals = "1||2-";
        ListViewDefaults.Strings.L_RelativeDateTime_Today = "Today";
        ListViewDefaults.Strings.L_UserFieldInlineTwo = "^1 and ^2";
        ListViewDefaults.Strings.L_UserFieldInlineThree = "^1, ^2, and ^3";
        ListViewDefaults.Strings.L_UserFieldInlineMore = "^1, ^2, ^3, and ^4^5 more^6";
        ListViewDefaults.Strings.L_SPCheckedoutto = "Checked Out To";
        ListViewDefaults.Strings.L_viewedit_onetidSortAsc = "Sort Ascending";
        ListViewDefaults.Strings.L_viewedit_onetidSortDesc = "Sort Descending";
        var BrowserDetection = {
            "__namespace": true
        };

        BrowserDetection_module_def();
        function BrowserDetection_module_def() {
        }
        (function() {
            Browseris.prototype = {
                firefox: undefined,
                firefox36up: undefined,
                firefox3up: undefined,
                firefox4up: undefined,
                ie: undefined,
                ie55up: undefined,
                ie5up: undefined,
                ie7down: undefined,
                ie8down: undefined,
                ie9down: undefined,
                ie8standard: undefined,
                ie8standardUp: undefined,
                ie9standardUp: undefined,
                ipad: undefined,
                windowsphone: undefined,
                chrome: undefined,
                chrome7up: undefined,
                chrome8up: undefined,
                chrome9up: undefined,
                iever: undefined,
                mac: undefined,
                major: undefined,
                msTouch: undefined,
                isTouch: undefined,
                nav: undefined,
                nav6: undefined,
                nav6up: undefined,
                nav7up: undefined,
                osver: undefined,
                safari: undefined,
                safari125up: undefined,
                safari3up: undefined,
                verIEFull: undefined,
                w3c: undefined,
                webKit: undefined,
                win: undefined,
                win8AppHost: undefined,
                win32: undefined,
                win64bit: undefined,
                winnt: undefined,
                armProcessor: undefined
            };
            function Browseris() {
                var agt = navigator.userAgent.toLowerCase();
                var navIdx;

                this.osver = 1.0;
                if (Boolean(agt)) {
                    var stOSVer = agt.substring(agt.indexOf("windows ") + 11);

                    this.osver = parseFloat(stOSVer);
                }
                this.major = parseInt(navigator.appVersion);
                this.nav = agt.indexOf('mozilla') != -1 && (agt.indexOf('spoofer') == -1 && agt.indexOf('compatible') == -1);
                this.nav6 = this.nav && this.major == 5;
                this.nav6up = this.nav && this.major >= 5;
                this.nav7up = false;
                if (this.nav6up) {
                    navIdx = agt.indexOf("netscape/");
                    if (navIdx >= 0)
                        this.nav7up = parseInt(agt.substring(navIdx + 9)) >= 7;
                }
                this.ie = agt.indexOf("msie") != -1;
                this.ipad = agt.indexOf("ipad") != -1;
                this.windowsphone = agt.indexOf("windows phone") != -1;
                this.aol = this.ie && agt.indexOf(" aol ") != -1;
                if (this.ie) {
                    var stIEVer = agt.substring(agt.indexOf("msie ") + 5);

                    this.iever = parseInt(stIEVer);
                    this.verIEFull = parseFloat(stIEVer);
                }
                else
                    this.iever = 0;
                this.ie4up = this.ie && this.major >= 4;
                this.ie5up = this.ie && this.iever >= 5;
                this.ie55up = this.ie && this.verIEFull >= 5.5;
                this.ie6up = this.ie && this.iever >= 6;
                this.ie7down = this.ie && this.iever <= 7;
                this.ie8down = this.ie && this.iever <= 8;
                this.ie9down = this.ie && this.iever <= 9;
                this.ie7up = this.ie && this.iever >= 7;
                this.ie8standard = this.ie && Boolean(document.documentMode) && document.documentMode == 8;
                this.ie8standardUp = this.ie && Boolean(document.documentMode) && document.documentMode >= 8;
                this.ie9standardUp = this.ie && Boolean(document.documentMode) && document.documentMode >= 9;
                this.ie10standardUp = this.ie && Boolean(document.documentMode) && document.documentMode >= 10;
                this.winnt = agt.indexOf("winnt") != -1 || agt.indexOf("windows nt") != -1;
                this.win32 = this.major >= 4 && navigator.platform == "Win32" || agt.indexOf("win32") != -1 || agt.indexOf("32bit") != -1;
                this.win64bit = agt.indexOf("win64") != -1;
                this.win = this.winnt || this.win32 || this.win64bit;
                this.mac = agt.indexOf("mac") != -1;
                this.w3c = this.nav6up;
                this.webKit = agt.indexOf("webkit") != -1;
                this.safari = agt.indexOf("webkit") != -1;
                this.safari125up = false;
                this.safari3up = false;
                if (this.safari && this.major >= 5) {
                    navIdx = agt.indexOf("webkit/");
                    if (navIdx >= 0)
                        this.safari125up = parseInt(agt.substring(navIdx + 7)) >= 125;
                    var verIdx = agt.indexOf("version/");

                    if (verIdx >= 0)
                        this.safari3up = parseInt(agt.substring(verIdx + 8)) >= 3;
                }
                this.firefox = this.nav && agt.indexOf("firefox") != -1;
                this.firefox3up = false;
                this.firefox36up = false;
                this.firefox4up = false;
                if (this.firefox && this.major >= 5) {
                    var ffVerIdx = agt.indexOf("firefox/");

                    if (ffVerIdx >= 0) {
                        var firefoxVStr = agt.substring(ffVerIdx + 8);

                        this.firefox3up = parseInt(firefoxVStr) >= 3;
                        this.firefox36up = parseFloat(firefoxVStr) >= 3.6;
                        this.firefox4up = parseInt(firefoxVStr) >= 4;
                    }
                }
                this.win8AppHost = agt.indexOf("msapphost") != -1;
                this.chrome = this.nav && agt.indexOf("chrome") != -1;
                this.chrome7up = false;
                this.chrome8up = false;
                this.chrome9up = false;
                if (this.chrome && this.major >= 5) {
                    var chmVerIdx = agt.indexOf("chrome/");

                    if (chmVerIdx >= 0) {
                        var chmVerStr = agt.substring(chmVerIdx + 7);
                        var chmVerInt = parseInt(chmVerStr);

                        this.chrome7up = chmVerInt >= 7;
                        this.chrome8up = chmVerInt >= 8;
                        this.chrome9up = chmVerInt >= 9;
                    }
                }
                this.msTouch = typeof navigator.msPointerEnabled != "undefined" && navigator.msPointerEnabled;
                this.isTouch = this.msTouch || "ontouchstart" in document.documentElement;
                this.armProcessor = agt.indexOf("arm") != -1;
            }
            BrowserDetection.userAgent = new Browseris();
        })();
        var CSSUtil = {
            "__namespace": true
        };

        CSSUtil_module_def();
        function CSSUtil_module_def() {
            function BuildRegex(className) {
                return new RegExp('(\\s|^)' + className + '(\\s|$)');
            }
            CSSUtil.HasClass = function(elem, className) {
                if (elem == null || className == null) {
                    return false;
                }
                return elem.className.match(BuildRegex(className)) != null;
            };
            CSSUtil.AddClass = function(elem, className) {
                if (!CSSUtil.HasClass(elem, className)) {
                    elem.className += " " + className;
                    return true;
                }
                return false;
            };
            CSSUtil.RemoveClass = function(elem, className) {
                if (CSSUtil.HasClass(elem, className)) {
                    elem.className = elem.className.replace(BuildRegex(className), ' ');
                    return true;
                }
                return false;
            };
            CSSUtil.pxToNum = function(px) {
                var ret;

                if (px === "" || px === "none") {
                    ret = 0;
                }
                else {
                    ret = parseInt(px);
                }
                return ret;
            };
            CSSUtil.numToPx = function(n) {
                if (typeof n != "number") {
                    throw new Error("n must be a number.");
                }
                return String(Math.round(n)) + "px";
            };
            CSSUtil.getCurrentStyle = function(element, cssStyle) {
                if (Boolean(element.currentStyle))
                    return element.currentStyle[cssStyle];
                else {
                    if (Boolean(window) && Boolean(window.getComputedStyle)) {
                        var compStyle = window.getComputedStyle(element, null);

                        if (Boolean(compStyle) && Boolean(compStyle.getPropertyValue)) {
                            return compStyle.getPropertyValue(cssStyle);
                        }
                    }
                }
                return null;
            };
            CSSUtil.getCurrentStyleCorrect = function(element, camelStyleName, dashStyleName) {
                if (typeof document.defaultView != 'undefined' && typeof document.defaultView.getComputedStyle != 'undefined') {
                    return (document.defaultView.getComputedStyle(element, null)).getPropertyValue(dashStyleName);
                }
                else {
                    if (camelStyleName == 'width') {
                        return String(element.offsetWidth) + "px";
                    }
                    return element.currentStyle[camelStyleName];
                }
            };
            CSSUtil.getOpacity = function(element) {
                return XUIHtml.GetOpacity(element);
            };
            CSSUtil.setOpacity = function(element, value) {
                XUIHtml.SetOpacity(element, value);
            };
            var XUIHtml = {};

            XUIHtml.SetOpacity = function(domNode, newVal) {
                if (typeof domNode.style == "undefined")
                    return;
                if (document.body.style.opacity != null) {
                    if (newVal == 1)
                        XUIHtml.RemoveCSSProperty(domNode, "opacity");
                    else {
                        domNode.style.opacity = String(newVal);
                    }
                }
                else {
                    if (newVal == 1)
                        XUIHtml.RemoveCSSProperty(domNode, "filter");
                    else
                        domNode.style.filter = 'alpha(opacity=' + String(newVal * 100) + ')';
                }
            };
            XUIHtml.RemoveCSSProperty = function(domNode, propName) {
                if (typeof domNode.style.removeProperty != "undefined")
                    domNode.style.removeProperty(propName);
                else
                    domNode.style.removeAttribute(propName);
            };
            XUIHtml.GetOpacity = function(domNode) {
                if (typeof domNode.style == "undefined")
                    return -1;
                if (document.body.style.opacity != null) {
                    var o = domNode.style.opacity;

                    return o != null && o != '' ? parseFloat(o) : 1;
                }
                else {
                    var f = domNode.style.filter;

                    return f != null && f != '' ? parseInt((f.replace('alpha(opacity=', '')).replace(')', '')) / 100 : 1;
                }
            };
        }
        ;
        var DOM = {
            "__namespace": true
        };

        DOM_module_def();
        function DOM_module_def() {
            DOM.rightToLeft = document.documentElement.dir == "rtl";
            DOM.cancelDefault = DOM_cancelDefault;
            DOM.AbsLeft = DOM_AbsLeft;
            DOM.AbsTop = DOM_AbsTop;
            DOM.CancelEvent = DOM_CancelEvent;
            DOM.GetElementsByName = DOM_GetElementsByName;
            DOM.GetEventCoords = DOM_GetEventCoords;
            DOM.GetEventSrcElement = DOM_GetEventSrcElement;
            DOM.GetInnerText = DOM_GetInnerText;
            DOM.PreventDefaultNavigation = DOM_PreventDefaultNavigation;
            function DOM_cancelDefault(evt) {
                if (typeof evt == "undefined" || evt == null) {
                    evt = window.event;
                }
                if (!(typeof evt == "undefined" || evt == null)) {
                    if (typeof evt.stopPropagation == "function")
                        evt.stopPropagation();
                    else
                        evt.cancelBubble = true;
                    if (typeof evt.preventDefault == "function")
                        evt.preventDefault();
                    else
                        evt.returnValue = false;
                }
                return false;
            }
            function DOM_CancelEvent(e) {
                e.cancelBubble = true;
                if (Boolean(e.preventDefault))
                    e.preventDefault();
                e.returnValue = false;
                return false;
            }
            function DOM_GetElementsByName(str) {
                var ret = document.getElementsByName(str);

                if (ret.length == 0 && Boolean(XMLHttpRequest)) {
                    ret = FFGetElementsById(document, str);
                }
                return ret;
                function FFGetElementsById(doc, tabId) {
                    var rg = [];
                    var ele = doc.getElementById(tabId);

                    while (ele != null) {
                        rg.push(ele);
                        ele.id = "";
                        ele = doc.getElementById(tabId);
                    }
                    var i;

                    for (i = 0; i < rg.length; i++) {
                        rg[i].id = tabId;
                    }
                    return rg;
                }
            }
            function DOM_GetEventSrcElement(e) {
                if (e.target != null) {
                    return e.target;
                }
                else if (typeof e.srcElement != 'undefined') {
                    return e.srcElement;
                }
                else {
                    (function() {
                        if (!false) {
                            if (confirm("Assertion failed: " + "could not get source element from event" + ". Break into debugger?"))
                                eval("debugger");
                        }
                    })();
                    ;
                    return null;
                }
            }
            function DOM_GetInnerText(elem) {
                if (typeof elem.textContent !== "undefined" && elem.textContent !== null) {
                    return elem.textContent;
                }
                else if (typeof elem.innerText !== "undefined") {
                    return elem.innerText;
                }
                (function() {
                    if (!false) {
                        if (confirm("Assertion failed: " + "GetInnerText: browser doesn't seem to implement textContent or innerText" + ". Break into debugger?"))
                            eval("debugger");
                    }
                })();
                return undefined;
            }
            function DOM_PreventDefaultNavigation(evt) {
                if (typeof evt == "undefined" || evt == null) {
                    evt = window.event;
                }
                if (!(typeof evt == "undefined" || evt == null)) {
                    if (evt.preventDefault == null)
                        evt.returnValue = false;
                    else
                        evt.preventDefault();
                }
            }
            function DOM_Abs(obj, propName) {
                var x = obj[propName];
                var p = obj.offsetParent;

                while (p != null && p.tagName != "BODY") {
                    x += p[propName];
                    p = p.offsetParent;
                }
                if (p != null)
                    x += p[propName];
                return x;
            }
            function DOM_AbsLeft(obj) {
                return DOM_Abs(obj, "offsetLeft");
            }
            function DOM_AbsTop(obj) {
                return DOM_Abs(obj, "offsetTop");
            }
            function DOM_GetEventCoords(ev) {
                var x, y;

                if ("undefined" !== typeof ev.pageX && "undefined" !== typeof ev.pageY) {
                    x = ev.pageX;
                    y = ev.pageY;
                }
                else {
                    x = ev.clientX;
                    y = ev.clientY;
                    if ("undefined" !== typeof document.body && null !== document.body) {
                        x += document.body.scrollLeft;
                        y += document.body.scrollTop;
                    }
                    if ("undefined" !== typeof document.documentElement && null !== document.documentElement) {
                        x += document.documentElement.scrollLeft;
                        y += document.documentElement.scrollTop;
                    }
                }
                return {
                    x: x,
                    y: y
                };
            }
        }
        var Encoding = {
            "__namespace": true
        };

        Encoding_module_def();
        function Encoding_module_def() {
            Encoding.EncodeScriptQuote = Encoding_encodeScriptQuote;
            Encoding.HtmlEncode = Encoding_STSHtmlEncode;
            Encoding.HtmlDecode = Encoding_STSHtmlDecode;
            Encoding.AttrQuote = Encoding_StAttrQuote;
            Encoding.ScriptEncode = Encoding_STSScriptEncode;
            Encoding.ScriptEncodeWithQuote = Encoding_STSScriptEncodeWithQuote;
            function Encoding_encodeScriptQuote(str) {
                var strIn = new String(str);
                var strOut = [];
                var ix = 0;
                var max = strIn.length;

                for (ix = 0; ix < max; ix++) {
                    var ch = strIn.charAt(ix);

                    strOut.push(ch == '\'' ? "%27" : ch);
                }
                return strOut.join('');
            }
            function Encoding_STSHtmlEncode(str) {
                if (null == str)
                    return "";
                var strIn = new String(str);
                var strOut = [];
                var ix = 0;
                var max = strIn.length;

                for (ix = 0; ix < max; ix++) {
                    var ch = strIn.charAt(ix);

                    switch (ch) {
                    case '<':
                        strOut.push("&lt;");
                        break;
                    case '>':
                        strOut.push("&gt;");
                        break;
                    case '&':
                        strOut.push("&amp;");
                        break;
                    case '\"':
                        strOut.push("&quot;");
                        break;
                    case '\'':
                        strOut.push("&#39;");
                        break;
                    default:
                        strOut.push(ch);
                        break;
                    }
                }
                return strOut.join('');
            }
            function Encoding_STSHtmlDecode(str) {
                if (null == str)
                    return "";
                var rRegexs = [/\&lt;/g, /\&gt;/g, /\&quot;/g, /\&#39;/g, /\&#58;/g, /\&#123;/g, /\&#125;/g, /\&amp;/g];
                var rSubtitutes = ["<", ">", "\"", "'", ":", "{", "}", "&"];
                var strOut = [];
                var ix = 0;
                var len = rRegexs.length;

                for (ix = 0; ix < len; ix++) {
                    var firstAmpPos = str.indexOf("&");

                    if (-1 != firstAmpPos) {
                        if (0 < firstAmpPos) {
                            strOut.push(str.substr(0, firstAmpPos));
                            str = str.substr(firstAmpPos);
                        }
                        str = str.replace(rRegexs[ix], rSubtitutes[ix]);
                    }
                    else {
                        break;
                    }
                }
                strOut.push(str);
                return strOut.join('');
            }
            function Encoding_StAttrQuote(st) {
                st = st.toString();
                st = st.replace(/&/g, '&amp;');
                st = st.replace(/\"/g, '&quot;');
                st = st.replace(/\r/g, '&#13;');
                return '"' + st + '"';
            }
            function Encoding_STSScriptEncode(str) {
                if (null == str || typeof str == 'undefined')
                    return "";
                var strIn = new String(str);
                var strOut = [];
                var ix = 0;
                var max = strIn.length;

                for (ix = 0; ix < max; ix++) {
                    var charCode = strIn.charCodeAt(ix);

                    if (charCode > 0x0fff) {
                        strOut.push("\\u" + (charCode.toString(16)).toUpperCase());
                    }
                    else if (charCode > 0x00ff) {
                        strOut.push("\\u0" + (charCode.toString(16)).toUpperCase());
                    }
                    else if (charCode > 0x007f) {
                        strOut.push("\\u00" + (charCode.toString(16)).toUpperCase());
                    }
                    else {
                        var c = strIn.charAt(ix);

                        switch (c) {
                        case '\n':
                            strOut.push("\\n");
                            break;
                        case '\r':
                            strOut.push("\\r");
                            break;
                        case '\"':
                            strOut.push("\\u0022");
                            break;
                        case '%':
                            strOut.push("\\u0025");
                            break;
                        case '&':
                            strOut.push("\\u0026");
                            break;
                        case '\'':
                            strOut.push("\\u0027");
                            break;
                        case '(':
                            strOut.push("\\u0028");
                            break;
                        case ')':
                            strOut.push("\\u0029");
                            break;
                        case '+':
                            strOut.push("\\u002b");
                            break;
                        case '/':
                            strOut.push("\\u002f");
                            break;
                        case '<':
                            strOut.push("\\u003c");
                            break;
                        case '>':
                            strOut.push("\\u003e");
                            break;
                        case '\\':
                            strOut.push("\\\\");
                            break;
                        default:
                            strOut.push(c);
                        }
                        ;
                    }
                }
                return strOut.join('');
            }
            function Encoding_STSScriptEncodeWithQuote(str) {
                return '"' + Encoding_STSScriptEncode(str) + '"';
            }
        }
        var IE8Support = {
            "__namespace": true
        };

        IE8Support_module_def();
        function IE8Support_module_def() {
            IE8Support.arrayIndexOf = function(array, item, startIdx) {
                if (typeof Array.prototype.indexOf != "undefined") {
                    return array.indexOf(item, startIdx);
                }
                if (typeof item === "undefined")
                    return -1;
                var l = array.length;

                if (l !== 0) {
                    startIdx = startIdx - 0;
                    if (isNaN(startIdx)) {
                        startIdx = 0;
                    }
                    else {
                        if (isFinite(startIdx)) {
                            startIdx = startIdx - startIdx % 1;
                        }
                        if (startIdx < 0) {
                            startIdx = Math.max(0, l + startIdx);
                        }
                    }
                    for (var i = startIdx; i < l; i++) {
                        if (typeof array[i] !== "undefined" && array[i] === item) {
                            return i;
                        }
                    }
                }
                return -1;
            };
            IE8Support.attachDOMContentLoaded = function(handler) {
                if (typeof document.addEventListener == 'undefined') {
                    document.onreadystatechange = function() {
                        if (document.readyState == "complete") {
                            handler();
                        }
                    };
                }
                else {
                    document.addEventListener("DOMContentLoaded", handler, false);
                }
            };
            IE8Support.getComputedStyle = function(domObj, camelStyleName, dashStyleName) {
                if (typeof document.defaultView != 'undefined' && typeof document.defaultView.getComputedStyle != 'undefined') {
                    return (document.defaultView.getComputedStyle(domObj, null)).getPropertyValue(dashStyleName);
                }
                else {
                    if (camelStyleName == 'width') {
                        return String(domObj.offsetWidth) + "px";
                    }
                    return domObj.currentStyle[camelStyleName];
                }
            };
            IE8Support.stopPropagation = function(evt) {
                if (typeof evt.stopPropagation == "function")
                    evt.stopPropagation();
                else
                    evt.cancelBubble = true;
            };
            if (typeof Array.isArray == 'undefined') {
                Array.isArray = function(obj) {
                    return typeof obj == 'object' && obj instanceof Array;
                };
            }
            if (typeof Object.create == 'undefined') {
                Object.create = function(proto, properties) {
                    (function() {
                        if (!(typeof properties == 'undefined')) {
                            if (confirm("Assertion failed: " + "argument 'properties' is not supported in IE8." + ". Break into debugger?"))
                                eval("debugger");
                        }
                    })();
                    ;
                    function ctr() {
                    }
                    ctr.prototype = proto;
                    return new ctr;
                };
            }
            if (typeof String.prototype.trim == "undefined") {
                String.prototype.trim = function() {
                    return this.replace(/^\s+|\s+$/g, '');
                };
            }
        }
        var Renderer = function() {
            var _this = this;
            var _id = Renderer.FunctionDispatcher.GetNextId();
            var _templates = {};

            this._GetId = function() {
                return _id;
            };
            this._GetTemplate = function(templateName) {
                return _templates[templateName];
            };
            this.SetTemplate = function(templateName, template) {
                if (typeof template == "undefined" || template == null)
                    delete _templates[templateName];
                else
                    _templates[templateName] = template;
            };
            this.RegisterHandler = function(handlerName, handler) {
                Renderer.FunctionDispatcher.RegisterFunction(_id, handlerName, handler);
            };
            this.UnregisterHandler = function(handlerName, handler) {
                return Renderer.FunctionDispatcher.UnregisterFunction(_id, handlerName, handler);
            };
            this.Render = function(templateName, data) {
                if (templateName in _templates) {
                    return Renderer.Engine.Render(templateName, data, _this);
                }
                else {
                    throw new Error("No template with name " + templateName);
                }
            };
        };

        Renderer.Engine = new (function() {
            var compiler_v1 = new Compiler_v1();
            var compiler_v2 = new Compiler_v2();

            this.Render = function(templateName, data, renderer) {
                return executeTemplate(templateName, data, renderer);
            };
            function executeTemplate(templateName, data, renderer) {
                var executingTemplate;
                var template = renderer._GetTemplate(templateName);

                if (typeof template === "function") {
                    executingTemplate = template;
                }
                else if (typeof template === "string") {
                    executingTemplate = compileTemplate(template);
                    renderer.SetTemplate(templateName, executingTemplate);
                }
                else {
                    throw new Error("Template with name " + templateName + " invalid");
                }
                var result = executingTemplate(data, renderer);

                return result;
            }
            function compileTemplate(templateContents) {
                if (!Boolean(templateContents)) {
                    return function(a, b) {
                        return "";
                    };
                }
                var searchIndex = templateContents.search(/^\s*\{%version/i);

                if (searchIndex != 0) {
                    return compiler_v1.Compile(templateContents);
                }
                else {
                    var lBrace = templateContents.indexOf("{");
                    var rBrace = templateContents.indexOf("}", lBrace);

                    if (rBrace < 0) {
                        throw new Error("Template Syntax Error! {%version} ending brace expected, but none found");
                    }
                    var version = (templateContents.slice(lBrace + "{%version".length, rBrace)).trim();
                    var templateStr = templateContents.slice(rBrace + 1);

                    if (version == "2.0") {
                        return compiler_v2.Compile(templateStr);
                    }
                    else {
                        throw new Error("Template Syntax Error! Invalid Version number");
                    }
                }
            }
            function Compiler_v1() {
                this.Compile = function(templateStr) {
                    var strFunc = "var p=[]; p.push('" + ((((((((((templateStr.replace(/[\r\t\n]/g, " ")).replace(/'(?=[^#]*#>)/g, "\t")).split("'")).join("\\'")).split("\t")).join("'")).replace(/<#=(.+?)#>/g, "',$1,'")).split("<#")).join("');")).split("#>")).join("p.push('") + "'); return p.join('');";
                    var func;

                    func = new Function("ctx", "renderer", strFunc);
                    return func;
                };
            }
            function Compiler_v2() {
                var _operationClosuresMap = {
                    "comment": commentOperation,
                    "value": valueOperation,
                    "template": templateOperation,
                    "foreach": foreachOperation,
                    "templateselect": templateSelectOperation,
                    "handler": handlerOperation,
                    "templatechoice": templateSelectOperation
                };

                this.Compile = function(templateStr) {
                    var operations = [];

                    templateStr = replaceConstructShortForms(templateStr);
                    var start;
                    var after = 0;

                    while ((start = findIndexOfNextConstruct(templateStr, after)) >= 0) {
                        if (start > after) {
                            operations.push(stringOperation(templateStr.slice(after, start)));
                        }
                        var end = templateStr.indexOf("}", start);

                        if (end < 0) {
                            throw new Error("Template Syntax Error! Ending brace expected, but none found.");
                        }
                        after = end + 1;
                        var constructStr = templateStr.slice(start, end);
                        var parts = parseConstruct(constructStr);
                        var constructName = parts[0].toLowerCase();

                        parts.shift();
                        if (constructName in _operationClosuresMap) {
                            var op = _operationClosuresMap[constructName].apply(this, parts);

                            operations.push(op);
                        }
                        else {
                            throw new Error("Template Syntax Error! Invalid construct: " + constructStr);
                        }
                    }
                    if (after < templateStr.length) {
                        operations.push(stringOperation(templateStr.slice(after)));
                    }
                    return function Template(data, renderer) {
                        var result = [];

                        for (var i = 0, count = operations.length; i < count; i++)
                            operations[i](data, renderer, result);
                        return result.join("");
                    };
                };
                function parseConstruct(constructStr) {
                    if (constructStr.charAt(constructStr.length - 1) == "}")
                        constructStr = constructStr.slice(0, -1);
                    constructStr = constructStr.slice("{%".length);
                    constructStr = constructStr.trim();
                    var parts = constructStr.split(/\s+/);

                    if (parts[0] == "") {
                        throw new Error("Template Syntax Error! Empty construct");
                    }
                    return parts;
                }
                function replaceConstructShortForms(templateStr) {
                    var result = templateStr;

                    result = result.replace(/{\/\//g, "{%comment ");
                    result = result.replace(/{=/g, "{%value ");
                    result = result.replace(/{\+/g, "{%handler ");
                    return result;
                }
                function findIndexOfNextConstruct(templateStr, startIndex) {
                    return templateStr.indexOf("{%", startIndex);
                }
                function getValueAtPath(data, path) {
                    if (!Boolean(path) || path == ".")
                        return data;
                    if (path.charAt(0) == "/") {
                        data = window;
                    }
                    var parts = path.split("/");

                    for (var i = 0, count = parts.length; i < count; i++) {
                        if (parts[i] == "" || parts[i] == ".")
                            continue;
                        if (data != null && typeof data[parts[i]] != "undefined")
                            data = data[parts[i]];
                        else
                            return null;
                    }
                    return data;
                }
                function stringOperation(string) {
                    return function StringOperation(data, renderer, result) {
                        result.push(string);
                    };
                }
                function commentOperation() {
                    return function CommentOperation(data, renderer, result) {
                    };
                }
                function valueOperation(path) {
                    if (arguments.length > 1)
                        throw new Error("Template Syntax Error! Value construct expected 0-1 parameters, but " + String(arguments.length) + " given");
                    if (!Boolean(path))
                        path = ".";
                    return function ValueOperation(data, renderer, result) {
                        var value = getValueAtPath(data, path);

                        result.push(value);
                    };
                }
                function templateOperation(templateName, path) {
                    if (arguments.length == 0 || arguments.length > 2)
                        throw new Error("Template Syntax Error! Template construct expected 1-2 parameters, but " + String(arguments.length) + " given");
                    if (!Boolean(path))
                        path = ".";
                    return function TemplateOperation(data, renderer, result) {
                        var value = getValueAtPath(data, path);

                        result.push(renderer.Render(templateName, value));
                    };
                }
                function foreachOperation(templateName, path) {
                    if (arguments.length == 0 || arguments.length > 2)
                        throw new Error("Template Syntax Error! Foreach construct expected 1-2 parameters, but " + String(arguments.length) + " given");
                    if (!Boolean(path))
                        path = ".";
                    return function ForeachOperation(data, renderer, result) {
                        var value = getValueAtPath(data, path);

                        if (Array.isArray(value)) {
                            var array = value;

                            for (var i = 0, count = array.length; i < count; i++) {
                                result.push(renderer.Render(templateName, array[i]));
                            }
                        }
                        else {
                            throw new Error("Foreach Operation expected an array, but no array given");
                        }
                    };
                }
                function templateSelectOperation(templatePath, dataPath) {
                    if (arguments.length == 0 || arguments.length > 2)
                        throw new Error("Template Syntax Error! TemplateSelect construct expected 1-2 parameters, but " + String(arguments.length) + " given");
                    if (!Boolean(dataPath))
                        dataPath = ".";
                    return function TemplateSelectOperation(data, renderer, result) {
                        var templateName = getValueAtPath(data, templatePath);

                        if (typeof templateName == "string") {
                            var value = getValueAtPath(data, dataPath);

                            result.push(renderer.Render(templateName, value));
                        }
                        else {
                            throw new Error("TemplateSelect Operation expected a string for template name, but no string given");
                        }
                    };
                }
                function handlerOperation(handlerName) {
                    if (!Boolean(handlerName))
                        throw new Error("Template Syntax Error! Handler construct needs a function name");
                    var extraClosureArgs = [].slice.call(arguments, 1);

                    return function HandlerOperation(data, renderer, result) {
                        var parametersBuilder = [];

                        parametersBuilder.push("this");
                        parametersBuilder.push(renderer._GetId());
                        parametersBuilder.push("&quot;" + handlerName + "&quot;");
                        parametersBuilder.push("event");
                        for (var i = 0; i < extraClosureArgs.length; i++) {
                            var value = getValueAtPath(data, extraClosureArgs[i]);
                            var objId = Renderer.FunctionDispatcher.RegisterObject(value);

                            parametersBuilder.push("Renderer.FunctionDispatcher.GetObject(" + String(objId) + ")");
                        }
                        var string = "Renderer.FunctionDispatcher.Execute(" + parametersBuilder.join(",") + ")";

                        result.push(string);
                    };
                }
            }
        })();
        Renderer.FunctionDispatcher = new (function() {
            var _functions = [];
            var _objects = [];

            this.GetNextId = function() {
                var nextId = _functions.length;

                _functions.push(new Object());
                return nextId;
            };
            this.RegisterObject = function(obj) {
                var nextId = _objects.length;

                _objects.push(obj);
                return nextId;
            };
            this.GetObject = function(objId) {
                if (objId < 0 || objId >= _objects.length)
                    throw new Error("No object registered with id " + String(objId));
                return _objects[objId];
            };
            this.RegisterFunction = function(id, funcName, func) {
                if (id < 0 || id >= _functions.length)
                    throw new Error("No Renderer registered with id " + String(id));
                if (typeof func != "function")
                    throw new Error("RegisterFunction expected a function, but none given");
                if (!Boolean(_functions[id][funcName]))
                    _functions[id][funcName] = [];
                _functions[id][funcName].push(func);
            };
            this.UnregisterFunction = function(id, funcName, func) {
                if (id < 0 || id >= _functions.length)
                    throw new Error("No Renderer registered with id " + String(id));
                if (!Boolean(_functions[id][funcName]))
                    return false;
                var found = false;
                var funcIndex = _functions[id][funcName].indexOf(func);

                if (funcIndex != -1) {
                    _functions[id][funcName].splice(funcIndex, 1);
                    found = true;
                }
                if (_functions[id][funcName].length == 0)
                    delete _functions[id][funcName];
                return found;
            };
            this.Execute = function(thisObj, id, funcName) {
                if (id < 0 || id >= _functions.length)
                    throw new Error("No Renderer registered with id " + String(id));
                if (!Boolean(_functions[id][funcName]))
                    throw new Error("No function registered with name " + funcName + " for Renderer ID " + String(id));
                var args = [].slice.call(arguments, 3);
                var funcs = _functions[id][funcName];

                for (var i = 0; i < funcs.length; i++) {
                    var f = funcs[i];

                    if (i == 0 && funcs.length == 1)
                        return f.apply(thisObj, args);
                    else
                        f.apply(thisObj, args);
                }
            };
        })();
        var ListModule = {
            "__namespace": true
        };

        ListModule_module_def();
        function ListModule_module_def() {
            ListModule.BasePermissions = function() {
            };
            ListModule.BasePermissions.prototype = {
                ManageLists: undefined,
                OpenItems: undefined
            };
            ListModule.Context = List_ContextInfo;
            ListModule.Context.prototype = {
                AllowGridMode: undefined,
                BasePermissions: undefined,
                BaseViewID: undefined,
                CascadeDeleteWarningMessage: undefined,
                ContentTypesEnabled: undefined,
                CurrentSelectedItems: undefined,
                CurrentUserId: undefined,
                EnableMinorVersions: undefined,
                ExternalDataList: undefined,
                HasRelatedCascadeLists: undefined,
                HttpPath: undefined,
                HttpRoot: undefined,
                LastSelectableRowIdx: undefined,
                LastSelectedItemIID: undefined,
                LastRowIndexSelected: undefined,
                RowFocusTimerID: undefined,
                ListData: undefined,
                ListSchema: undefined,
                ModerationStatus: undefined,
                PortalUrl: undefined,
                RecycleBinEnabled: undefined,
                SelectAllCbx: undefined,
                SendToLocationName: undefined,
                SendToLocationUrl: undefined,
                StateInitDone: undefined,
                TableCbxFocusHandler: undefined,
                TableMouseoverHandler: undefined,
                TotalListItems: undefined,
                WorkflowsAssociated: undefined,
                clvp: undefined,
                ctxId: undefined,
                ctxType: undefined,
                dictSel: undefined,
                displayFormUrl: undefined,
                editFormUrl: undefined,
                imagesPath: undefined,
                inGridMode: undefined,
                inGridFullRender: undefined,
                isForceCheckout: undefined,
                isModerated: undefined,
                isPortalTemplate: undefined,
                isVersions: undefined,
                isWebEditorPreview: undefined,
                leavingGridMode: false,
                loadingAsyncData: false,
                listBaseType: undefined,
                listName: undefined,
                listTemplate: undefined,
                listUrlDir: undefined,
                newFormUrl: undefined,
                onRefreshFailed: undefined,
                overrideDeleteConfirmation: undefined,
                overrideFilterQstring: undefined,
                recursiveView: undefined,
                rootFolderForDisplay: undefined,
                serverUrl: undefined,
                verEnabled: undefined,
                view: undefined,
                queryString: undefined,
                IsClientRendering: undefined,
                wpq: undefined,
                rootFolder: undefined,
                IsAppWeb: undefined,
                NewWOPIDocumentEnabled: undefined,
                NewWOPIDocumentUrl: undefined,
                AllowCreateFolder: undefined,
                CanShareLinkForNewDocument: undefined,
                noGroupCollapse: undefined,
                SiteTemplateId: undefined,
                ExcludeFromOfflineClient: false
            };
            ListModule.Context.Type = {
                EditMenu: 0,
                ViewSelector: 1
            };
            function List_ContextInfo() {
                this.listBaseType = null;
                this.listTemplate = null;
                this.listName = null;
                this.view = null;
                this.listUrlDir = null;
                this.HttpPath = null;
                this.HttpRoot = null;
                this.serverUrl = null;
                this.imagesPath = null;
                this.PortalUrl = null;
                this.RecycleBinEnabled = null;
                this.enteringGridMode = false;
                this.inGridMode = false;
                this.isWebEditorPreview = null;
                this.rootFolderForDisplay = null;
                this.isPortalTemplate = null;
                this.isModerated = false;
                this.recursiveView = false;
                this.displayFormUrl = null;
                this.editFormUrl = null;
                this.newFormUrl = null;
                this.ctxId = null;
                this.CurrentUserId = null;
                this.isForceCheckout = false;
                this.EnableMinorVersions = false;
                this.ModerationStatus = 0;
                this.verEnabled = 0;
                this.isVersions = 0;
                this.WorkflowsAssociated = false;
                this.ExternalDataList = false;
                this.HasRelatedCascadeLists = 0;
                this.CascadeDeleteWarningMessage = null;
                this.ContentTypesEnabled = false;
                this.SendToLocationName = "";
                this.SendToLocationUrl = "";
                this.StateInitDone = false;
                this.TotalListItems = null;
                this.CurrentSelectedItems = null;
                this.LastSelectableRowIdx = null;
                this.SelectAllCbx = null;
                this.TableCbxFocusHandler = null;
                this.TableMouseoverHandler = null;
            }
        }
        var List_Util = {
            "__namespace": true
        };

        List_Util_module_def();
        function List_Util_module_def() {
            (function() {
                if (!(ListModule != null)) {
                    if (confirm("Assertion failed: " + ("ListModule" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ListModule.Util = {};
            ListModule.Util.createViewEditUrl = List_createViewEditUrl;
            ListModule.Util.createItemPropertiesTitleUrl = List_CreateItemPropertiesTitleUrl;
            ListModule.Util.clearSelectedItemsDict = List_ClearSelectedItemsDict;
            ListModule.Util.ctxInitItemState = List_ctxInitItemState;
            ListModule.Util.getAttributeFromItemTable = List_GetAttributeFromItemTable;
            ListModule.Util.getSelectedItemsDict = List_GetSelectedItemsDict;
            ListModule.Util.removeOnlyPagingArgs = List_RemoveOnlyPagingArgs;
            ListModule.Util.removePagingArgs = List_RemovePagingArgs;
            ListModule.Util.showAttachmentRows = List_ShowAttachmentRows;
            function List_RemoveOnlyPagingArgs(strUrl) {
                var rePagedFlag = /&*Paged=TRUE/gi;

                strUrl = strUrl.replace(rePagedFlag, "");
                var rePagedPrevFlag = /&*PagedPrev=TRUE/gi;

                strUrl = strUrl.replace(rePagedPrevFlag, "");
                var rePagedArgs = /&p_[^&]*/gi;

                strUrl = strUrl.replace(rePagedArgs, "");
                var rePagedRow = /&PageFirstRow=[^&]*/gi;

                strUrl = strUrl.replace(rePagedRow, "");
                var rePagedLastRow = /&PageLastRow=[^&]*/gi;

                strUrl = strUrl.replace(rePagedLastRow, "");
                return strUrl;
            }
            function List_RemovePagingArgs(strUrl) {
                strUrl = List_RemoveOnlyPagingArgs(strUrl);
                var reFilter1 = /\?Filter=1&*/gi;

                strUrl = strUrl.replace(reFilter1, "?");
                var reFilter2 = /&Filter=1/gi;

                strUrl = strUrl.replace(reFilter2, "");
                var reOrphanedQMark = /\?$/;

                strUrl = strUrl.replace(reOrphanedQMark, "");
                return strUrl;
            }
            function List_GetAttributeFromItemTable(itemTableParam, strAttributeName, strAttributeOldName) {
                var attrValue = itemTableParam != null ? itemTableParam.getAttribute(strAttributeName) : null;

                if (attrValue == null && itemTableParam != null && strAttributeOldName != null)
                    attrValue = itemTableParam.getAttribute(strAttributeOldName);
                return attrValue;
            }
            function List_ctxInitItemState(ctxCur) {
                ctxCur.TotalListItems = 0;
                ctxCur.CurrentSelectedItems = 0;
                ctxCur.LastSelectableRowIdx = 0;
                ctxCur.StateInitDone = true;
            }
            function List_ClearSelectedItemsDict(context) {
                if (context != null)
                    context.dictSel = [];
            }
            function List_ShowAttachmentRows() {
                var elm = document.getElementById('idAttachmentsTable');
                var elmAttachmentRow = document.getElementById('idAttachmentsRow');

                if (elmAttachmentRow != null) {
                    if (elm == null || elm.rows.length == 0)
                        elmAttachmentRow.style.display = 'none';
                    else
                        elmAttachmentRow.style.display = 'table-row';
                }
            }
            function List_GetSelectedItemsDict(ctxParam) {
                if (ctxParam != null && ctxParam.dictSel != null) {
                    return ctxParam.dictSel;
                }
                return null;
            }
            function List_createViewEditUrl(renderCtx, listItem, useEditFormUrl, appendSource) {
                var titleUrl = [];

                if (useEditFormUrl)
                    titleUrl.push(renderCtx.editFormUrl);
                else
                    titleUrl.push(renderCtx.displayFormUrl);
                titleUrl.push("&ID=");
                titleUrl.push(listItem.ID);
                titleUrl.push("&ContentTypeID=");
                titleUrl.push(listItem.ContentTypeId);
                if (appendSource) {
                    titleUrl.push("&Source=");
                    titleUrl.push(Nav.getSource());
                }
                return titleUrl.join('');
            }
            function List_CreateItemPropertiesTitleUrl(renderCtx, listItem) {
                if (renderCtx.inGridMode) {
                    return List_createViewEditUrl(renderCtx, listItem, true, false);
                }
                return List_createViewEditUrl(renderCtx, listItem, false, false);
            }
        }
        var StringUtil = {
            "__namespace": true
        };

        StringUtil_module_def();
        function StringUtil_module_def() {
            StringUtil.BuildParam = StringUtil_StBuildParam;
            if (typeof String.prototype.endsWith == "undefined") {
                String.prototype.endsWith = function(suffix) {
                    return this.substr(this.length - suffix.length) === suffix;
                };
            }
            if (typeof String.prototype.startsWith == "undefined") {
                String.prototype.startsWith = function(prefix) {
                    return this.substr(0, prefix.length) === prefix;
                };
            }
            function StringUtil_StBuildParam(stPattern) {
                var re;
                var i;

                for (i = 1; i < arguments.length; i++) {
                    re = new RegExp("\\^" + String(i));
                    stPattern = stPattern.replace(re, arguments[i]);
                }
                return stPattern;
            }
        }
        var TypeUtil = {
            "__namespace": true
        };

        TypeUtil_module_def();
        function TypeUtil_module_def() {
            TypeUtil.IsArray = TypeUtil_IsArray;
            TypeUtil.IsNullOrUndefined = TypeUtil_IsNullOrUndefined;
            function TypeUtil_IsArray(input) {
                return typeof input == 'object' && input instanceof Array;
            }
            function TypeUtil_IsNullOrUndefined(value) {
                return value == null || value == undefined;
            }
        }
        var URI = function(uriString, options) {
            var that = this;
            var URI_POUND = "#";
            var URI_COLON = ":";
            var URI_FORWARDSLASH = "/";
            var URI_DOUBLE_FORWARDSLASHES = "//";
            var URI_QUESTIONMARK = "?";
            var URI_SEMICOLON = ";";
            var URI_AMPERSAND = "&";
            var URI_AT = "@";
            var URI_EQUAL = "=";
            var URI_DELIMITERS = ";/?:@&=$,";
            var URI_AUTHORITY_TERMINATORS = "/?";
            var m_queryCaseInsensitive = false;

            if (typeof options !== "undefined" && typeof options.queryCaseInsensitive === 'boolean') {
                m_queryCaseInsensitive = options.queryCaseInsensitive;
            }
            var m_disableEncodingDecodingForLegacyCode = false;

            if (typeof options !== "undefined" && typeof options.disableEncodingDecodingForLegacyCode === 'boolean') {
                m_disableEncodingDecodingForLegacyCode = options.disableEncodingDecodingForLegacyCode;
            }
            var m_pathCaseInsensitive = false;

            if (typeof options !== "undefined" && typeof options.pathCaseInsensitive === 'boolean') {
                m_pathCaseInsensitive = options.pathCaseInsensitive;
            }
            var m_scheme = "";
            var m_user = "";
            var m_host = "";
            var m_port = "";
            var m_path = "";
            var m_pathEncoded = "";
            var m_parameters = "";
            var m_query = {};
            var m_fragment = "";

            this.getScheme = function() {
                return m_scheme;
            };
            this.setScheme = function(scheme) {
                m_scheme = decodeURIComponentIfNecessary(scheme);
            };
            this.getAuthority = function() {
                return getAuthority(false);
            };
            this.setAuthority = function(authority) {
                parseAuthority(authority);
            };
            this.getUser = function() {
                return m_user;
            };
            this.getHost = function() {
                return m_host;
            };
            this.getPort = function() {
                return m_port;
            };
            this.getPath = function(trimTrailingSlash) {
                var retPath = m_path;

                if (typeof trimTrailingSlash === 'boolean' && trimTrailingSlash) {
                    if (retPath !== null && retPath.lastIndexOf(URI_FORWARDSLASH) === retPath.length - 1) {
                        retPath = retPath.slice(0, -1);
                    }
                }
                return retPath;
            };
            this.setPath = function(path) {
                if (path.indexOf(URI_FORWARDSLASH) !== 0) {
                    path = URI_FORWARDSLASH + path;
                }
                parsePath(path);
            };
            this.getPathSegments = function() {
                if (m_path === null) {
                    return [];
                }
                var ret = m_path.split(URI_FORWARDSLASH);

                if (ret.length > 0) {
                    if (ret[0] === "") {
                        ret.shift();
                    }
                    else if (ret[ret.length - 1] === "") {
                        ret.pop();
                    }
                }
                return ret;
            };
            this.getLastPathSegment = function(includeParameters) {
                var pathSegments = that.getPathSegments();

                if (pathSegments.length === 0) {
                    return "";
                }
                else {
                    var retPath = pathSegments[pathSegments.length - 1];

                    if (typeof includeParameters !== 'boolean' || !includeParameters) {
                        var paramBeginPos = retPath.indexOf(URI_SEMICOLON);

                        if (paramBeginPos >= 0) {
                            retPath = retPath.substring(0, paramBeginPos);
                        }
                    }
                    return retPath;
                }
            };
            this.getParameters = function() {
                return m_parameters;
            };
            this.getQuery = function() {
                return serializeQuery(m_query);
            };
            this.setQuery = function(query) {
                var queryObject = deserializeQuery(query);

                that.setQueryFromObject(queryObject);
            };
            this.getQueryAsObject = function() {
                return m_query;
            };
            this.setQueryFromObject = function(queryObj) {
                m_query = {};
                for (var queryKey in queryObj) {
                    if (queryObj.hasOwnProperty(queryKey)) {
                        that.setQueryParameter(queryKey, queryObj[queryKey]);
                    }
                }
            };
            this.getQueryParameter = function(queryKey) {
                var ret = null;
                var query = that.getQueryAsObject();

                if (m_queryCaseInsensitive) {
                    for (var key in query) {
                        if (m_query.hasOwnProperty(key) && key.toLowerCase() === queryKey.toLowerCase()) {
                            ret = query[key];
                        }
                    }
                }
                else {
                    ret = query[queryKey];
                }
                if (typeof ret !== 'undefined') {
                    return ret;
                }
                else {
                    return null;
                }
            };
            this.setQueryParameter = function(queryKey, queryValue) {
                var queryKeyDecoded = decodeURIComponentIfNecessary(queryKey);
                var queryValueDecoded = decodeURIComponentIfNecessary(queryValue);

                m_query[queryKeyDecoded] = queryValueDecoded;
            };
            this.removeQueryParameter = function(queryKey) {
                var queryKeyDecoded = decodeURIComponentIfNecessary(queryKey);

                delete m_query[queryKeyDecoded];
            };
            this.getFragment = function() {
                return m_fragment;
            };
            this.setFragment = function(fragment) {
                if (fragment.indexOf(URI_POUND) === 0) {
                    fragment = fragment.substring(1);
                }
                m_fragment = decodeURIComponentIfNecessary(fragment);
            };
            var isStringEqualInensitive = function(a, b) {
                if (a != null && b != null) {
                    return a.toLowerCase() === b.toLowerCase();
                }
                else {
                    return a === b;
                }
            };
            var isStringEqual = function(a, b) {
                return a === b;
            };

            this.equals = function(uri) {
                return m_scheme.toLowerCase() === (uri.getScheme()).toLowerCase() && m_user === uri.getUser() && m_host.toLowerCase() === (uri.getHost()).toLowerCase() && m_port === uri.getPort() && (m_pathCaseInsensitive ? isStringEqualInensitive : isStringEqual)(that.getPath(true), uri.getPath(true)) && m_parameters === uri.getParameters() && (m_queryCaseInsensitive ? isStringEqualInensitive : isStringEqual)(that.getQuery(), uri.getQuery()) && m_fragment === uri.getFragment();
            };
            this.getString = function() {
                return getStringInternal(true);
            };
            this.getDecodedStringForDisplay = function() {
                return getStringInternal(false);
            };
            this.getStringWithoutQueryAndFragment = function() {
                return getStringWithoutQueryAndFragmentInternal(true);
            };
            var getStringInternal = function(encoded) {
                var ret = getStringWithoutQueryAndFragmentInternal(encoded);
                var query = serializeQuery(m_query, encoded);

                if (query !== "") {
                    ret += URI_QUESTIONMARK + query;
                }
                if (m_fragment !== "") {
                    ret += URI_POUND + (encoded ? encodeURIComponentIfNecessary(m_fragment) : m_fragment);
                }
                return ret;
            };
            var getStringWithoutQueryAndFragmentInternal = function(encoded) {
                var ret = "";

                if (m_scheme !== "") {
                    ret += (encoded ? encodeURIComponentIfNecessary(m_scheme) : m_scheme) + URI_COLON;
                }
                var authority = getAuthority(encoded);

                if (authority !== "") {
                    ret += URI_DOUBLE_FORWARDSLASHES + authority;
                }
                if (m_pathEncoded !== "") {
                    ret += encoded ? m_pathEncoded : m_path;
                }
                return ret;
            };

            this.getDebugInternals = function() {
                return "scheme:" + that.getScheme() + ", auth:" + that.getAuthority() + ", user:" + that.getUser() + ", host:" + that.getHost() + ", port:" + that.getPort() + ", path:" + that.getPath() + ", params:" + that.getParameters() + ", query:" + that.getQuery() + ", frag:" + that.getFragment();
            };
            var normalizeQueryKey = function(queryKey) {
                var key = queryKey;

                if (m_queryCaseInsensitive) {
                    key = key.toLowerCase();
                }
                return key;
            };
            var deserializeQuery = function(queryStr) {
                var queryObj = {};

                if (queryStr.indexOf(URI_QUESTIONMARK) === 0) {
                    queryStr = queryStr.substring(1);
                }
                var queryParts = queryStr.split(/[;&]+/);

                for (var queryIdx = 0; queryIdx < queryParts.length; queryIdx++) {
                    var queryPart = queryParts[queryIdx];
                    var queryPartSegments = queryPart.split(URI_EQUAL);

                    if (queryPartSegments.length > 0) {
                        var queryKey = queryPartSegments[0];

                        if (queryKey.length > 0) {
                            var queryValue = "";

                            if (queryPartSegments.length == 2) {
                                queryValue = queryPartSegments[1];
                            }
                            queryObj[queryKey] = queryValue;
                        }
                    }
                }
                return queryObj;
            };
            var serializeQuery = function(queryObj, encoded) {
                encoded = typeof encoded === "undefined" ? false : encoded;
                var queryStr = "";

                for (var queryKey in queryObj) {
                    if (queryObj.hasOwnProperty(queryKey)) {
                        var key = queryKey;
                        var value = queryObj[queryKey];

                        if (encoded) {
                            key = encodeURIComponentIfNecessary(key);
                            value = encodeURIComponentIfNecessary(value);
                        }
                        if (value === null || value === "") {
                            queryStr += key + URI_EQUAL + URI_AMPERSAND;
                        }
                        else {
                            queryStr += key + URI_EQUAL + value + URI_AMPERSAND;
                        }
                    }
                }
                if (queryStr !== "") {
                    queryStr = queryStr.slice(0, -1);
                }
                return queryStr;
            };
            var parseURI = function() {
                var remainingString = uriString;
                var fragmentBeginPos = remainingString.indexOf(URI_POUND);

                if (fragmentBeginPos >= 0) {
                    var fragment = remainingString.substring(fragmentBeginPos + 1);

                    that.setFragment(fragment);
                    remainingString = remainingString.substring(0, fragmentBeginPos);
                }
                var schemeEndPos = findOneOf(remainingString, URI_DELIMITERS);

                if (schemeEndPos >= 0) {
                    var firstColonPos = remainingString.indexOf(URI_COLON);

                    if (firstColonPos >= 0 && firstColonPos === schemeEndPos) {
                        m_scheme = remainingString.substring(0, schemeEndPos);
                        remainingString = remainingString.substring(schemeEndPos + 1);
                    }
                }
                else {
                    parsePath(remainingString);
                    return;
                }
                var authority = "";
                var doubleSlashPos = remainingString.indexOf(URI_DOUBLE_FORWARDSLASHES);

                if (doubleSlashPos >= 0 && doubleSlashPos === 0) {
                    remainingString = remainingString.substring(2);
                    var nothingElseLeft;
                    var authorityEndPos = findOneOf(remainingString, URI_AUTHORITY_TERMINATORS);

                    if (authorityEndPos >= 0) {
                        authority = remainingString.substring(0, authorityEndPos);
                        remainingString = remainingString.substring(authorityEndPos);
                        nothingElseLeft = false;
                    }
                    else {
                        authority = remainingString;
                        nothingElseLeft = true;
                    }
                    parseAuthority(authority);
                    if (nothingElseLeft) {
                        return;
                    }
                }
                var queryBeginPos = remainingString.indexOf(URI_QUESTIONMARK);

                if (queryBeginPos >= 0) {
                    that.setQuery(remainingString.substring(queryBeginPos + 1));
                    remainingString = remainingString.substring(0, queryBeginPos);
                }
                parsePath(remainingString);
            };
            var parseAuthority = function(authority) {
                m_host = authority;
                var userNameEndPos = authority.lastIndexOf(URI_AT);

                if (userNameEndPos >= 0) {
                    m_host = m_host.substring(userNameEndPos + 1);
                }
                var hostPortSeparatorPos = m_host.indexOf(URI_COLON);

                if (userNameEndPos < 0 && hostPortSeparatorPos < 0) {
                    return;
                }
                var authorityComponents = authority;

                if (userNameEndPos < 0) {
                    m_host = authorityComponents;
                }
                else {
                    m_user = authorityComponents.substring(0, userNameEndPos);
                    m_host = authorityComponents.substring(userNameEndPos + 1);
                }
                if (hostPortSeparatorPos >= 0) {
                    m_port = m_host.substring(hostPortSeparatorPos + 1);
                    m_host = m_host.substring(0, hostPortSeparatorPos);
                }
                m_user = decodeURIComponentIfNecessary(m_user);
                m_host = decodeURIComponentIfNecessary(m_host);
            };
            var parsePath = function(remainingString) {
                var paramBeginPos = remainingString.indexOf(URI_SEMICOLON);

                if (paramBeginPos >= 0) {
                    m_parameters = decodeURIComponentIfNecessary(remainingString.substring(paramBeginPos + 1));
                }
                m_path = decodeURIComponentIfNecessary(remainingString);
                var encodedPathSegments = remainingString.split(URI_FORWARDSLASH);

                for (var i = 0; i < encodedPathSegments.length; ++i) {
                    var segment = encodedPathSegments[i];
                    var segmentAndParameters = segment.split(URI_SEMICOLON);
                    var decodedSegment = decodeURIComponentIfNecessary(segmentAndParameters[0]);

                    encodedPathSegments[i] = encodeURIComponentIfNecessary(decodedSegment);
                    for (var j = 1; j < segmentAndParameters.length; ++j) {
                        var decodedParameter = decodeURIComponentIfNecessary(segmentAndParameters[j]);

                        encodedPathSegments[i] += URI_SEMICOLON + encodeURIComponentIfNecessary(decodedParameter);
                    }
                }
                m_pathEncoded = encodedPathSegments.join(URI_FORWARDSLASH);
            };
            var findOneOf = function(str, searchValues) {
                for (var strIdx = 0; strIdx < str.length; strIdx++) {
                    var c = str[strIdx];

                    for (var delimIdx = 0; delimIdx < searchValues.length; delimIdx++) {
                        if (c === searchValues[delimIdx]) {
                            return strIdx;
                        }
                    }
                }
                return -1;
            };
            var getUserEncodedIfNecessary = function() {
                var user;

                if (m_disableEncodingDecodingForLegacyCode) {
                    user = m_user;
                }
                else {
                    user = encodeURIComponentIfNecessary(m_user);
                    user = user.replace("%3A", ":");
                }
                return user;
            };
            var getAuthority = function(encoded) {
                var authority = "";
                var user;
                var host;
                var port;

                if (encoded) {
                    user = getUserEncodedIfNecessary();
                    host = encodeURIComponentIfNecessary(m_host);
                    port = encodeURIComponentIfNecessary(m_port);
                }
                else {
                    user = m_user;
                    host = m_host;
                    port = m_port;
                }
                if (user !== "") {
                    authority = user + URI_AT;
                }
                if (m_host !== "") {
                    authority += host;
                }
                if (m_port !== "") {
                    authority += URI_COLON + port;
                }
                return authority;
            };
            var encodeURIComponentIfNecessary = function(component) {
                return m_disableEncodingDecodingForLegacyCode ? component : encodeURIComponent(component);
            };
            var decodeURIComponentIfNecessary = function(component) {
                return m_disableEncodingDecodingForLegacyCode ? component : URI.decodeURIComponent(component);
            };

            parseURI();
        };

        (function() {
            var g_rgdwchMinEncoded = [0x00000000, 0x00000080, 0x00000800, 0x00010000, 0x00200000, 0x04000000, 0x80000000];

            function Vutf8ToUnicode(rgBytes) {
                var ix = 0;
                var strResult = "";
                var dwch, wch, uch;
                var nTrailBytes, nTrailBytesOrig;

                while (ix < rgBytes.length) {
                    if (rgBytes[ix] <= 0x007f) {
                        strResult += String.fromCharCode(rgBytes[ix++]);
                    }
                    else {
                        uch = rgBytes[ix++];
                        nTrailBytes = Boolean(uch & 0x20) ? Boolean(uch & 0x10) ? 3 : 2 : 1;
                        nTrailBytesOrig = nTrailBytes;
                        dwch = uch & 0xff >>> 2 + nTrailBytes;
                        while (Boolean(nTrailBytes) && ix < rgBytes.length) {
                            --nTrailBytes;
                            uch = rgBytes[ix++];
                            if (uch == 0) {
                                return strResult;
                            }
                            if ((uch & 0xC0) != 0x80) {
                                strResult += '?';
                                break;
                            }
                            dwch = dwch << 6 | uch & 0x003f;
                        }
                        if (Boolean(nTrailBytes)) {
                            strResult += '?';
                            break;
                        }
                        if (dwch < g_rgdwchMinEncoded[nTrailBytesOrig]) {
                            strResult += '?';
                            break;
                        }
                        else if (dwch <= 0xffff) {
                            strResult += String.fromCharCode(dwch);
                        }
                        else if (dwch <= 0x10ffff) {
                            dwch -= 0x10000;
                            strResult += String.fromCharCode(0xD800 | dwch >>> 10);
                            strResult += String.fromCharCode(0xDC00 | dwch & 0x003FF);
                        }
                        else {
                            strResult += '?';
                        }
                    }
                }
                return strResult;
            }
            function unescapeProperlyInternal(str) {
                if (str == null)
                    return "null";
                var ix = 0, ixEntity = 0;
                var strResult = "";
                var rgUTF8Bytes = [];
                var ixUTF8Bytes = 0;
                var hexString, hexCode;

                while (ix < str.length) {
                    if (str.charAt(ix) == '%') {
                        if (str.charAt(++ix) == 'u') {
                            hexString = "";
                            for (ixEntity = 0; ixEntity < 4 && ix < str.length; ++ixEntity) {
                                hexString += str.charAt(++ix);
                            }
                            while (hexString.length < 4) {
                                hexString += '0';
                            }
                            hexCode = parseInt(hexString, 16);
                            if (isNaN(hexCode)) {
                                strResult += '?';
                            }
                            else {
                                strResult += String.fromCharCode(hexCode);
                            }
                        }
                        else {
                            hexString = "";
                            for (ixEntity = 0; ixEntity < 2 && ix < str.length; ++ixEntity) {
                                hexString += str.charAt(ix++);
                            }
                            while (hexString.length < 2) {
                                hexString += '0';
                            }
                            hexCode = parseInt(hexString, 16);
                            if (isNaN(hexCode)) {
                                if (Boolean(ixUTF8Bytes)) {
                                    strResult += Vutf8ToUnicode(rgUTF8Bytes);
                                    ixUTF8Bytes = 0;
                                    rgUTF8Bytes.length = ixUTF8Bytes;
                                }
                                strResult += '?';
                            }
                            else {
                                rgUTF8Bytes[ixUTF8Bytes++] = hexCode;
                            }
                        }
                    }
                    else {
                        if (Boolean(ixUTF8Bytes)) {
                            strResult += Vutf8ToUnicode(rgUTF8Bytes);
                            ixUTF8Bytes = 0;
                            rgUTF8Bytes.length = ixUTF8Bytes;
                        }
                        strResult += str.charAt(ix++);
                    }
                }
                if (Boolean(ixUTF8Bytes)) {
                    strResult += Vutf8ToUnicode(rgUTF8Bytes);
                    ixUTF8Bytes = 0;
                    rgUTF8Bytes.length = ixUTF8Bytes;
                }
                return strResult;
            }
            function URI_unescapeProperly(str) {
                var strResult = null;

                try {
                    strResult = decodeURIComponent(str);
                }
                catch (e) {
                    strResult = unescapeProperlyInternal(str);
                }
                {
                    var strOurResult = unescapeProperlyInternal(str);

                    if (strResult != strOurResult) {
                        alert("unescapeProperly error\n" + "original string = " + str + "\n" + "decodeURIComponent string = " + strResult + "\n" + "unescapeProperlyInternal string = " + strOurResult);
                    }
                }
                return strResult;
            }
            function URI_GetAbsoluteUrl(url) {
                var dummyAnchor = document.createElement('a');

                dummyAnchor.href = url;
                var retVal = dummyAnchor.href;

                dummyAnchor = null;
                return retVal;
            }
            ;
            function URI_RemoveQueryParameterFromUrl(stURL, stParameterName) {
                var re = new RegExp("[&?]" + stParameterName + "=[^&]*", "");

                stURL = stURL.replace(re, "");
                if (stURL.indexOf("?") == -1) {
                    var ich = stURL.indexOf("&");

                    if (ich != -1)
                        stURL = stURL.substring(0, ich) + "?" + stURL.substring(ich + 1);
                }
                return stURL;
            }
            function URI_RemoveUrlKeyValue(keyName, url) {
                var re = new RegExp(keyName + "=[^&]*&");

                url = url.replace(re, "");
                re = new RegExp(keyName + "=[^&]*");
                url = url.replace(re, "");
                return url;
            }
            function URI_RemoveParametersFromUrl(url) {
                var paramsBeginPos = url.indexOf('?');

                if (paramsBeginPos == -1)
                    return url;
                else
                    return url.substr(0, paramsBeginPos);
            }
            URI.decodeURIComponent = URI_unescapeProperly;
            URI.getAbsolute = URI_GetAbsoluteUrl;
            URI.removeKeyValue = URI_RemoveUrlKeyValue;
            URI.removeParameters = URI_RemoveParametersFromUrl;
            URI.removeQueryParameter = URI_RemoveQueryParameterFromUrl;
        })();
        var URI_Encoding = {
            "__namespace": true
        };

        URI_Encoding_module_def();
        function URI_Encoding_module_def() {
            function URI_escapeProperly(str, bAsUrl, bForFilterQuery, bForCallback) {
                var strOut = "";
                var strByte;
                var ix = 0;
                var strEscaped = " \"%<>\'&";

                if (typeof str == "undefined")
                    return "";
                for (ix = 0; ix < str.length; ix++) {
                    var charCode = str.charCodeAt(ix);
                    var curChar = str.charAt(ix);

                    if (bAsUrl && (curChar == '#' || curChar == '?')) {
                        strOut += str.substr(ix);
                        break;
                    }
                    if (bForFilterQuery && curChar == '&') {
                        strOut += curChar;
                        continue;
                    }
                    if (charCode <= 0x7f) {
                        if (bForCallback) {
                            strOut += curChar;
                        }
                        else {
                            if (charCode >= 97 && charCode <= 122 || charCode >= 65 && charCode <= 90 || charCode >= 48 && charCode <= 57 || bAsUrl && (charCode >= 32 && charCode <= 95) && strEscaped.indexOf(curChar) < 0) {
                                strOut += curChar;
                            }
                            else if (charCode <= 0x0f) {
                                strOut += "%0" + (charCode.toString(16)).toUpperCase();
                            }
                            else if (charCode <= 0x7f) {
                                strOut += "%" + (charCode.toString(16)).toUpperCase();
                            }
                        }
                    }
                    else if (charCode <= 0x07ff) {
                        strByte = 0xc0 | charCode >> 6;
                        strOut += "%" + (strByte.toString(16)).toUpperCase();
                        strByte = 0x80 | charCode & 0x003f;
                        strOut += "%" + (strByte.toString(16)).toUpperCase();
                    }
                    else if ((charCode & 0xFC00) != 0xD800) {
                        strByte = 0xe0 | charCode >> 12;
                        strOut += "%" + (strByte.toString(16)).toUpperCase();
                        strByte = 0x80 | (charCode & 0x0fc0) >> 6;
                        strOut += "%" + (strByte.toString(16)).toUpperCase();
                        strByte = 0x80 | charCode & 0x003f;
                        strOut += "%" + (strByte.toString(16)).toUpperCase();
                    }
                    else if (ix < str.length - 1) {
                        charCode = (charCode & 0x03FF) << 10;
                        ix++;
                        var nextCharCode = str.charCodeAt(ix);

                        charCode |= nextCharCode & 0x03FF;
                        charCode += 0x10000;
                        strByte = 0xf0 | charCode >> 18;
                        strOut += "%" + (strByte.toString(16)).toUpperCase();
                        strByte = 0x80 | (charCode & 0x3f000) >> 12;
                        strOut += "%" + (strByte.toString(16)).toUpperCase();
                        strByte = 0x80 | (charCode & 0x0fc0) >> 6;
                        strOut += "%" + (strByte.toString(16)).toUpperCase();
                        strByte = 0x80 | charCode & 0x003f;
                        strOut += "%" + (strByte.toString(16)).toUpperCase();
                    }
                }
                return strOut;
            }
            function URI_escapeUrlForCallback(str) {
                var iPound = str.indexOf("#");
                var iQues = str.indexOf("?");

                if (iPound > 0 && (iQues == -1 || iPound < iQues)) {
                    var strNew = str.substr(0, iPound);

                    if (iQues > 0) {
                        strNew += str.substr(iQues);
                    }
                    str = strNew;
                }
                return URI_escapeProperly(str, true, false, true);
            }
            URI_Encoding.encodeURIComponent = URI_escapeProperly;
            URI_Encoding.escapeUrlForCallback = URI_escapeUrlForCallback;
        }
        var DOM_afterglass = {
            "__namespace": true
        };

        DOM_afterglass_module_def();
        function DOM_afterglass_module_def() {
            (function() {
                if (!(IE8Support != null)) {
                    if (confirm("Assertion failed: " + ("IE8Support" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            DOM_afterglass.GetAncestor = DOM_GetAncestor;
            DOM_afterglass.GetAncestorByTagNames = DOM_GetAncestorByTagNames;
            DOM_afterglass.GetParentLinkFromEvent = DOM_GetParentLinkFromEvent;
            DOM_afterglass.GetPosition = DOM_GetPosition;
            DOM_afterglass.GetSelectedElement = DOM_GetSelectedElement;
            DOM_afterglass.IsContained = DOM_IsContained;
            DOM_afterglass.IsEventRightClickOnAnchor = DOM_IsEventRightClickOnAnchor;
            DOM_afterglass.IsEventTargetAnchor = DOM_IsEventTargetAnchor;
            function PositionInfo(positionLeft, positionTop, positionWidth, positionHeight) {
                this.left = positionLeft;
                this.top = positionTop;
                this.width = positionWidth;
                this.height = positionHeight;
            }
            PositionInfo.prototype = {
                left: 0,
                top: 0,
                width: 0,
                height: 0
            };
            function DOM_GetAncestor(elem, tag) {
                while (elem != null && elem.tagName != tag) {
                    elem = elem.parentNode;
                }
                return elem;
            }
            function DOM_GetAncestorByTagNames(elem, tagNames) {
                if (elem == null)
                    return null;
                var ancestor = elem.parentNode;

                while (ancestor != null) {
                    if (IE8Support.arrayIndexOf(tagNames, ancestor.tagName) >= 0)
                        break;
                    ancestor = ancestor.parentNode;
                }
                return ancestor;
            }
            function DOM_IsContained(elem, ancestor) {
                if (elem == ancestor)
                    return true;
                var elemArray = ancestor.getElementsByTagName(elem.tagName);

                for (var i = 0; i < elemArray.length; i++) {
                    if (elem == elemArray[i])
                        return true;
                }
                return false;
            }
            function DOM_GetPosition(node) {
                if (node == null) {
                    return null;
                }
                var left = 0;
                var t = 0;
                var width = 0;
                var height = 0;
                var parentNode = null;
                var offsetParent = null;

                offsetParent = node.offsetParent;
                var originalObject = node;
                var el = node;

                while (el.parentNode != null) {
                    el = el.parentNode;
                    if (el.offsetParent != null) {
                        var considerScroll = true;

                        if (typeof el.scrollTop == "number" && el.scrollTop > 0) {
                            t -= el.scrollTop;
                        }
                        if (typeof el.scrollLeft == "number" && el.scrollLeft > 0) {
                            left -= el.scrollLeft;
                        }
                    }
                    if (el == offsetParent) {
                        left += node.offsetLeft;
                        if (typeof el.clientLeft == "number" && el.nodeName != "TABLE") {
                            left += el.clientLeft;
                        }
                        t += node.offsetTop;
                        if (typeof el.clientTop == "number" && el.nodeName != "TABLE") {
                            t += el.clientTop;
                        }
                        node = el;
                        if (node.offsetParent == null) {
                            if (typeof node.offsetLeft == "number") {
                                left += node.offsetLeft;
                            }
                            if (typeof node.offsetTop == "number") {
                                t += node.offsetTop;
                            }
                        }
                        offsetParent = node.offsetParent;
                    }
                }
                if (typeof originalObject.offsetWidth == "number") {
                    width = originalObject.offsetWidth;
                }
                if (typeof originalObject.offsetHeight == "number") {
                    height = originalObject.offsetHeight;
                }
                return new PositionInfo(left, t, width, height);
            }
            function DOM_IsEventRightClickOnAnchor(evt) {
                if (evt == null)
                    return false;
                if (evt.type == "contextmenu") {
                    return DOM_IsEventTargetAnchor(evt);
                }
                return false;
            }
            function DOM_IsEventTargetAnchor(evt) {
                var elmTarget = DOM.GetEventSrcElement(evt);

                if (elmTarget != null && elmTarget.tagName.toUpperCase() == "A") {
                    return true;
                }
                return false;
            }
            function DOM_GetParentLinkFromEvent(e) {
                if (e == null)
                    e = window.event;
                var srcElement = DOM.GetEventSrcElement(e);
                var anchorElement = DOM_GetSelectedElement(srcElement, "A");

                if (anchorElement !== null && anchorElement.tagName === "A")
                    return anchorElement;
                else
                    return null;
            }
            function DOM_GetSelectedElement(elem, tagName, tagAlt) {
                while (elem != null && elem.tagName != tagName && (tagAlt == null || elem.tagName != tagAlt))
                    elem = elem.parentNode;
                return elem;
            }
        }
        function ContextMenu(def) {
            (function() {
                if (!(IE8Support != null)) {
                    if (confirm("Assertion failed: " + ("IE8Support" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            (function() {
                if (!(DOM != null)) {
                    if (confirm("Assertion failed: " + ("DOM" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            (function() {
                if (!(Renderer != null)) {
                    if (confirm("Assertion failed: " + ("Renderer" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            var rootElem = null;
            var overlay = null;
            var renderer = new Renderer();

            renderer.SetTemplate("overlay", "{%version 2.0}\u003cdiv class=\"ms-contextmenu-overlay\" onmousedown=\"{+overlayClick}\"\u003e\u003c/div\u003e");
            renderer.SetTemplate("root", "{%version 2.0}\u003cdiv class=\"ms-core-menu-box\" style=\"position:fixed; left: {=left}px; top: {=top}px;\" onclick=\"{+stopPropagation}\"\u003e\u003cul class=\"ms-core-menu-list\"\u003e\n                {%foreach item items}\n            \u003c/ul\u003e\u003c/div\u003e");
            renderer.SetTemplate("item", "{%version 2.0}{%templateSelect itemTemplate}");
            renderer.SetTemplate("separatorItem", "{%version 2.0}\u003cli class=\"ms-core-menu-separator\"\u003e\u003chr class=\"ms-core-menu-separatorHr\" /\u003e\u003c/li\u003e");
            renderer.SetTemplate("linkItem", "{%version 2.0}\u003cli class=\"ms-core-menu-item\"\u003e\u003ca class=\"ms-core-menu-link\" id=\"{=id}\" href=\"{=href}\" onclick=\"{+itemClick .}\"\u003e\n                {=text}\n            \u003c/a\u003e\u003c/li\u003e");
            renderer.SetTemplate("selectItem", "{%version 2.0}\u003cli class=\"ms-core-menu-item\"\u003e\u003cform class=\"ms-core-menu-link ms-menu-selectable\" onclick=\"{+itemSelect .}\"\u003e\u003cinput type=\"checkbox\" id=\"{=id}\" class=\"ms-menu-select\"\u003e{=text}\u003c/input\u003e\u003c/form\u003e\u003c/li\u003e");
            renderer.SetTemplate("glyphItem", "{%version 2.0}\u003cli class=\"ms-core-menu-item\"\u003e\u003ca class=\"ms-core-menu-link ms-menu-selectable\" id=\"{=id}\" onclick=\"{+itemClick .}\"\u003e\u003cspan class=\"ms-menu-select glyph-class\"\u003e{=glyph}\u003c/span\u003e{=text}\n            \u003c/a\u003e\u003c/li\u003e");
            renderer.SetTemplate("imgItem", "{%version 2.0}\u003cli class=\"ms-core-menu-item\"\u003e\u003ca class=\"ms-core-menu-link ms-menu-selectable\" id=\"{=id}\" onclick=\"{+itemSelect .}\"\u003e\u003cimg class=\"ms-menu-select\" src=\"{=imgsrc}\" alt=\"Smiley\" width=\"12\" height=\"12\" /\u003e{=text}\n            \u003c/a\u003e\u003c/li\u003e");
            var _idBase = "menuItemId_";

            this.open = function() {
                closeMenu();
                createOverlay();
                createMenu();
            };
            renderer.RegisterHandler("overlayClick", function(evt) {
                DOM.cancelDefault(evt);
                closeMenu();
                return false;
            });
            renderer.RegisterHandler("stopPropagation", IE8Support.stopPropagation);
            renderer.RegisterHandler("itemClick", function(evt, menuItem) {
                var listener = createEventListener.call(this, menuItem.onclick);

                return listener.call(this, evt, false, menuItem.id);
            });
            renderer.RegisterHandler("itemSelect", function(evt, menuItem) {
                var listener = createEventListener.call(this, menuItem.onclick);

                return listener.call(this, evt, true, menuItem.id);
            });
            for (var i = 0; i < def.items.length; i++) {
                var item = def.items[i];

                item.itemTemplate = item.separator === true ? "separatorItem" : item.selectable === true ? "selectItem" : item.imgsrc != null ? "imgItem" : item.glyph != null ? "glyphItem" : "linkItem";
                if (item.href == null) {
                    item.href = "javascript:";
                }
                if (!item.separator && (item.id == 'undefined' || item.id == null)) {
                    item.id = _idBase + ContextMenu._idUniqueNum.toString();
                    ContextMenu._idUniqueNum++;
                }
            }
            function closeMenu() {
                if (rootElem != null) {
                    document.body.removeChild(rootElem);
                    rootElem = null;
                }
                if (overlay != null) {
                    document.body.removeChild(overlay);
                    overlay = null;
                }
            }
            ;
            function render(templateName, obj) {
                var tempDiv = document.createElement("div");

                tempDiv.innerHTML = renderer.Render(templateName, obj);
                return tempDiv.removeChild(tempDiv.firstChild);
            }
            function createOverlay() {
                overlay = render("overlay");
                document.body.appendChild(overlay);
            }
            function createMenu() {
                var evt = def.evt;

                rootElem = render("root", {
                    'left': evt.clientX,
                    'top': evt.clientY,
                    'items': def.items
                });
                document.body.appendChild(rootElem);
            }
            function createEventListener(listener) {
                return function(evt, bonclickCloseMenu, itemId) {
                    if (!bonclickCloseMenu) {
                        closeMenu();
                    }
                    if (listener == null) {
                        return;
                    }
                    return listener.call(this, evt);
                };
            }
        }
        ContextMenu.prototype.open = function() {
        };
        ContextMenu._idUniqueNum = 0;
        var Nav = {
            "__namespace": true
        };

        Nav_module_def();
        function Nav_module_def() {
            (function() {
                if (!(DOM != null)) {
                    if (confirm("Assertion failed: " + ("DOM" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            (function() {
                if (!(IE8Support != null)) {
                    if (confirm("Assertion failed: " + ("IE8Support" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            (function() {
                if (!(StringUtil != null)) {
                    if (confirm("Assertion failed: " + ("StringUtil" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            (function() {
                if (!(URI != null)) {
                    if (confirm("Assertion failed: " + ("URI" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            (function() {
                if (!(URI_Encoding != null)) {
                    if (confirm("Assertion failed: " + ("URI_Encoding" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            function AjaxNavigate() {
                this._list = new Array(0);
                this._fixLayoutsUrl = function AjaxNavigate$_fixLayoutsUrl(url) {
                    var idxLayouts = url.indexOf("_layouts/");

                    if (idxLayouts != -1) {
                        var strPostLayouts = url.substr(idxLayouts);
                        var expectedVersionNum = (strPostLayouts.split("/"))[1];

                        if (expectedVersionNum != null) {
                            if (isNaN(Number(expectedVersionNum)))
                                url = url.replace("_layouts/", "_layouts/15/");
                        }
                    }
                    return url;
                };
                this.update = function AjaxNavigate$update(url, updateParts, fullNavigate, anchorName) {
                    var oldHash = Nav_AjaxNavigate$_GetWindowLocationHash(window.location.href);
                    var hashObject = {};
                    var newHash = "";

                    if (null == url) {
                        if (oldHash != null && oldHash.length != 0) {
                            var parts = (oldHash.substr(1)).split('#');
                            var partsLength = parts.length;
                            var partPosStart = 0;

                            if ("undefined" != typeof g_MinimalDownload && g_MinimalDownload && partsLength > 0 && parts[0].length > 0 && parts[0][0] == '/') {
                                newHash = parts[0];
                                partPosStart = 1;
                            }
                            Nav_AjaxNavigate$_parseParams(hashObject, parts, partsLength, partPosStart);
                        }
                    }
                    else {
                        newHash = this._fixLayoutsUrl(url);
                    }
                    if ("undefined" != typeof updateParts) {
                        for (var part in updateParts) {
                            var partValue = updateParts[part];

                            if (null != partValue && "string" != typeof partValue && "number" != typeof partValue) {
                                throw "Unexpected";
                            }
                            if (null == partValue) {
                                if (hashObject[part] != null) {
                                    delete hashObject[part];
                                }
                            }
                            else {
                                hashObject[part] = updateParts[part];
                            }
                        }
                    }
                    if ("undefined" != typeof anchorName && anchorName != null && anchorName != "")
                        newHash += "#" + encodeURIComponent(anchorName);
                    for (part in hashObject) {
                        if (part != encodeURIComponent(part)) {
                            throw "Unexpected";
                        }
                        if (part != "anchorTag")
                            newHash += "#" + part + "=" + encodeURIComponent(hashObject[part]);
                    }
                    if (null != url) {
                        if (typeof _dlgWndTop == 'function' && typeof commonModalDialogClose == 'function') {
                            var dlgWnd = _dlgWndTop();

                            while (dlgWnd.g_childDialog != null) {
                                commonModalDialogClose(0, null);
                            }
                        }
                    }
                    var fDeltaManager = "undefined" != typeof asyncDeltaManager && Boolean(asyncDeltaManager) && "undefined" != typeof asyncDeltaManager._handleLocalAnchor && "undefined" != typeof asyncDeltaManager.SetCurrentUrl && "undefined" != typeof asyncDeltaManager._navigate;

                    if ("undefined" != typeof fullNavigate && fullNavigate || !fDeltaManager) {
                        if (newHash.startsWith('#')) {
                            window.location.hash = newHash;
                        }
                        else {
                            try {
                                window.location.href = newHash;
                            }
                            catch (ex) { }
                        }
                    }
                    else {
                        if (null == url) {
                            if (fDeltaManager) {
                                if ("undefined" != typeof anchorName && anchorName != null && anchorName != "")
                                    asyncDeltaManager._handleLocalAnchor(anchorName);
                                var startPageUrl = Nav_AjaxNavigate$_GetWindowLocationNoHash(window.location.href);
                                var newAction = Nav_GetUrlFromMDSLocation(startPageUrl, Nav_RemoveMDSQueryParametersFromUrl(newHash), true);

                                if (Boolean(newAction)) {
                                    asyncDeltaManager._savedFormAction = newAction;
                                }
                            }
                            window.location.hash = newHash;
                        }
                        else {
                            if (fDeltaManager) {
                                asyncDeltaManager.SetCurrentUrl(null);
                                asyncDeltaManager._navigate(newHash, anchorName, true);
                            }
                        }
                    }
                };
                this.add_navigate = function AjaxNavigate$add_navigate(handler) {
                    if ('function' != typeof handler)
                        throw "unexpected";
                    var index = IE8Support.arrayIndexOf(this._list, handler, 0);

                    if (-1 == index) {
                        this._list.push(handler);
                    }
                };
                this.remove_navigate = function AjaxNavigate$remove_navigate(handler) {
                    if ('function' != typeof handler)
                        throw "unexpected";
                    var index = IE8Support.arrayIndexOf(this._list, handler, 0);

                    if (-1 != index) {
                        this._list.splice(index, 1);
                    }
                };
                this._buildHashBag = function AjaxNavigate$_buildHashBag(hash) {
                    var hashObject = {};

                    try {
                        if (hash == "" || hash == "#") {
                            hashObject["url"] = "/";
                        }
                        else if (hash != null && hash.length != 0) {
                            var parts = (hash.substr(1)).split('#');
                            var partsLength = parts.length;
                            var partPosStart = 0;

                            if ("undefined" != typeof g_MinimalDownload && g_MinimalDownload && partsLength > 0 && parts[0].length > 0 && parts[0][0] == '/') {
                                hashObject["url"] = parts[0];
                                partPosStart = 1;
                            }
                            Nav_AjaxNavigate$_parseParams(hashObject, parts, partsLength, partPosStart);
                        }
                    }
                    catch (e) { }
                    ;
                    return hashObject;
                };
                this._raiseNavigate = function AjaxNavigate$_raiseNavigate(sender) {
                    var hashObject = this._buildHashBag(Nav_AjaxNavigate$_GetWindowLocationHash(window.location.href));
                    var listLen = this._list.length;

                    for (var i = 0, l = listLen; i < l; i++) {
                        this._list[i](sender, hashObject);
                    }
                };
                this._clear = function AjaxNavigate$_clear() {
                    this._list = new Array(0);
                };
                this.submit = function AjaxNavigate$submit(formToSubmit) {
                    if ("undefined" != typeof g_MinimalDownload && g_MinimalDownload && (window.location.pathname.toLowerCase()).endsWith("/_layouts/15/start.aspx") && "undefined" != typeof asyncDeltaManager && "undefined" != typeof asyncDeltaManager._onFormSubmitCore) {
                        asyncDeltaManager._onFormSubmitCore(formToSubmit);
                    }
                    else {
                        formToSubmit.submit();
                    }
                };
                this.getParam = function AjaxNavigate$_getParam(partName) {
                    var hashObject = this._buildHashBag(Nav_AjaxNavigate$_GetWindowLocationHash(window.location.href));

                    return hashObject[partName];
                };
                this.getSavedFormAction = function AjaxNavigate$_getSavedFormAction() {
                    var formAction = null;

                    if ("undefined" != typeof asyncDeltaManager && Boolean(asyncDeltaManager) && "undefined" != typeof asyncDeltaManager._savedFormAction) {
                        formAction = asyncDeltaManager._savedFormAction;
                        if (Boolean(formAction)) {
                            formAction = Nav_AjaxNavigate$_normalizeFormAction(formAction);
                        }
                    }
                    return formAction;
                };
                this.get_href = function AjaxNavigate$get_href() {
                    var ajaxLocation = null;

                    if ((window.location.pathname.toLowerCase()).endsWith("/_layouts/15/start.aspx")) {
                        if ("undefined" != typeof g_MinimalDownload && g_MinimalDownload) {
                            ajaxLocation = this.getSavedFormAction();
                        }
                        if (!Boolean(ajaxLocation)) {
                            ajaxLocation = Nav_AjaxNavigate$_getAjaxLocationWindow();
                        }
                    }
                    else {
                        ajaxLocation = window.location.href;
                    }
                    return ajaxLocation;
                };
                this.get_hash = function AjaxNavigate$get_hash() {
                    var ajaxHash = window.location.hash;

                    if ("undefined" != typeof g_MinimalDownload && g_MinimalDownload && (window.location.pathname.toLowerCase()).endsWith("/_layouts/15/start.aspx")) {
                        var hashIndex = ajaxHash.indexOf("#", 1);

                        ajaxHash = hashIndex > 0 ? ajaxHash.substr(hashIndex) : "";
                    }
                    return ajaxHash;
                };
                this.get_search = function AjaxNavigate$get_search() {
                    var ajaxsearch = "";

                    if ("undefined" != typeof g_MinimalDownload && g_MinimalDownload && (window.location.pathname.toLowerCase()).endsWith("/_layouts/15/start.aspx")) {
                        var href = this.getSavedFormAction();

                        if (Boolean(href)) {
                            var startSearch = href.indexOf("?");

                            if (-1 != startSearch) {
                                ajaxsearch = href.substr(startSearch);
                            }
                        }
                    }
                    else {
                        ajaxsearch = window.location.search;
                    }
                    return ajaxsearch;
                };
                this.convertMDSURLtoRegularURL = function Nav_AjaxNavigate$convertMDSURLtoRegularURL(mdsPath) {
                    var regularUrl = mdsPath;

                    if (mdsPath != null || mdsPath != "") {
                        var startPage = "/_layouts/15/start.aspx";
                        var idxMdsHash = (mdsPath.toLowerCase()).indexOf(startPage);

                        if (idxMdsHash != -1) {
                            var webUrl = mdsPath.substring(0, idxMdsHash);

                            idxMdsHash += startPage.length;
                            if (mdsPath.length == idxMdsHash) {
                                regularUrl = webUrl;
                            }
                            else if (mdsPath[idxMdsHash] == '#') {
                                idxMdsHash += 1;
                                if (mdsPath.length == idxMdsHash) {
                                    regularUrl = webUrl;
                                }
                                else if (mdsPath.length >= idxMdsHash + 2 && mdsPath[idxMdsHash] == '/' && mdsPath[idxMdsHash + 1] == '/') {
                                    var idxHttp = mdsPath.indexOf("://");

                                    if (idxHttp != -1) {
                                        var idxServerPath = mdsPath.indexOf("/", idxHttp + 3);

                                        if (idxServerPath != -1) {
                                            var serverPath = mdsPath.substring(0, idxServerPath);
                                            var serverRelativeUrl = mdsPath.substring(idxMdsHash + 1);

                                            regularUrl = Nav_AjaxNavigate$combineURL(serverPath, serverRelativeUrl);
                                        }
                                    }
                                }
                                else if (mdsPath.length >= idxMdsHash + 1 && mdsPath[idxMdsHash] == '/') {
                                    var webRelativeUrl = mdsPath.substring(idxMdsHash);

                                    regularUrl = Nav_AjaxNavigate$combineURL(webUrl, webRelativeUrl);
                                }
                            }
                        }
                    }
                    return regularUrl;
                };
            }
            function Nav_AjaxNavigate$WantsNewTab(evt) {
                if ("undefined" != typeof evt.ctrlKey && Boolean(evt.ctrlKey)) {
                    return true;
                }
                if ("undefined" != typeof evt.button && 1 == evt.button) {
                    return true;
                }
                return false;
            }
            function Nav_AjaxNavigate$OnClickHook(evt, topElem) {
                if (!(evt.returnValue === false || evt.defaultPrevented) && !Nav_AjaxNavigate$WantsNewTab(evt)) {
                    var srcElement = DOM.GetEventSrcElement(evt);
                    var currentElem = srcElement;
                    var anchorClick = false;

                    while (null != currentElem) {
                        if (null != currentElem.tagName && "A" == currentElem.tagName.toUpperCase()) {
                            anchorClick = true;
                            break;
                        }
                        if (currentElem == topElem)
                            break;
                        currentElem = currentElem.parentNode;
                    }
                    if (anchorClick && currentElem.href != null && currentElem.href.length > 0 && currentElem.href != "#") {
                        DOM.cancelDefault(evt);
                        Nav.navigate(currentElem.href);
                        return false;
                    }
                }
                return (function(u) {
                    return u;
                })();
            }
            function Nav_AjaxNavigate$_parseParams(hashObject, parts, partsLength, partPosStart) {
                var bLocalAnchor = false;

                for (var partPos = partPosStart; partPos < partsLength; partPos++) {
                    var part = parts[partPos];

                    if (null == part || 0 == part.length)
                        continue;
                    var eqPos = part.indexOf('=');
                    var key;
                    var value;

                    if (eqPos >= 1) {
                        key = part.substr(0, eqPos);
                        value = part.substr(eqPos + 1);
                        hashObject[key] = URI.decodeURIComponent(value);
                    }
                    else if (eqPos == -1 && !bLocalAnchor) {
                        if (bLocalAnchor)
                            throw "Unexpected";
                        key = "anchorTag";
                        value = part;
                        hashObject[key] = URI.decodeURIComponent(value);
                        bLocalAnchor = true;
                    }
                    else {
                        throw "Unexpected";
                    }
                }
            }
            function Nav_AjaxNavigate$_GetWindowLocationHash(href) {
                var nHashPos = href.indexOf('#');

                nHashPos = nHashPos > 0 ? nHashPos : href.length;
                return href.substr(nHashPos);
            }
            function Nav_AjaxNavigate$_GetWindowLocationNoHash(href) {
                var nHashPos = href.indexOf('#');

                nHashPos = nHashPos > 0 ? nHashPos : href.length;
                return href.substr(0, nHashPos);
            }
            function Nav_RemoveMDSQueryParametersFromUrl(inUrl) {
                return URI.removeQueryParameter(URI.removeQueryParameter(URI.removeQueryParameter(inUrl, 'AjaxDelta'), 'OrigMaster'), 'isStartPlt1');
            }
            function Nav_GetUrlFromMDSLocation(startPage, relativeMDSLocation, fServerAbsolute) {
                var anUndefined = (function() {
                })();

                if (startPage == null)
                    return anUndefined;
                if (relativeMDSLocation == null || relativeMDSLocation.length < 1 || relativeMDSLocation[0] != "/")
                    return anUndefined;
                var locationWeb = startPage.indexOf("/_layouts/15/start.aspx");

                if (-1 == locationWeb) {
                    return anUndefined;
                }
                var prefix;

                if (fServerAbsolute && '/' != startPage[0]) {
                    var startHostName = startPage.indexOf("://");

                    if (-1 == startHostName)
                        return anUndefined;
                    var firstSlash = startPage.indexOf("/", startHostName + 3);

                    prefix = startPage.substr(firstSlash, locationWeb - firstSlash);
                }
                else {
                    prefix = startPage.substr(0, locationWeb);
                }
                return prefix + relativeMDSLocation;
            }
            function Nav_AjaxNavigate$_UrlFromHashBag(hashObject) {
                var url = hashObject["url"];
                var anchorName = hashObject["anchorTag"];

                for (var part in hashObject) {
                    if (part != encodeURIComponent(part)) {
                        throw "Unexpected";
                    }
                    if (part != "anchorTag" && part != "url")
                        url += "#" + part + "=" + encodeURIComponent(hashObject[part]);
                }
                if (Boolean(anchorName)) {
                    url += "#" + anchorName;
                }
                if (null != url && url.length > 1 && "/" == url[0] && "/" == url[1]) {
                    return url.substr(1);
                }
                else {
                    var startPageUrl = Nav_AjaxNavigate$_GetWindowLocationNoHash(window.location.href);

                    return Nav_GetUrlFromMDSLocation(startPageUrl, url, true);
                }
            }
            function Nav_AjaxNavigate$parseHash(hash) {
                var hashObject = {};

                try {
                    if (hash != null && hash.length != 0) {
                        var parts = hash.split('#');

                        Nav_AjaxNavigate$_parseParams(hashObject, parts, parts.length, 0);
                    }
                }
                catch (e) { }
                ;
                return hashObject;
            }
            function Nav_AjaxNavigate$_normalizeFormAction(formAction) {
                var tmpForm = document.createElement('form');

                tmpForm.action = formAction;
                return tmpForm.action;
            }
            function Nav_AjaxNavigate$_getAjaxLocationWindow() {
                var ajaxLocation = null;
                var href = window.location.href;
                var startPos = (href.toLowerCase()).indexOf("/_layouts/15/start.aspx");
                var index1 = href.indexOf("://");
                var index2 = href.indexOf("/", index1 + 3);

                if (-1 == index2) {
                    index2 = href.length;
                }
                var hashPos = href.indexOf("#");

                if (-1 != hashPos && hashPos + 1 <= href.length && "/" == href[hashPos + 1]) {
                    if (hashPos + 2 <= href.length && "/" == href[hashPos + 2]) {
                        ajaxLocation = href.substr(0, index2) + href.substr(hashPos + 2);
                    }
                    else {
                        ajaxLocation = href.substr(0, startPos) + href.substr(hashPos + 1);
                    }
                }
                else {
                    ajaxLocation = href.substr(0, startPos);
                }
                return ajaxLocation;
            }
            function Nav_AjaxNavigate$combineURL(baseUrlPath, additionalNodes) {
                if (baseUrlPath.endsWith("/")) {
                    if (additionalNodes.startsWith("/"))
                        additionalNodes = additionalNodes.substring(1);
                    return baseUrlPath + additionalNodes;
                }
                else {
                    return additionalNodes.startsWith("/") ? baseUrlPath + additionalNodes : baseUrlPath + "/" + additionalNodes;
                }
            }
            function Nav_AjaxNavigate$isMDSURL(url) {
                var idxQuery = url.indexOf("?");

                if (-1 == idxQuery) {
                    idxQuery = url.length;
                }
                var idxHash = url.indexOf("#");

                if (-1 == idxHash) {
                    idxHash = url.length;
                }
                var idxMin = Math.min(idxQuery, idxHash);

                url = url.substr(0, idxMin);
                return (url.toLowerCase()).endsWith("/_layouts/15/start.aspx");
            }
            function Nav_AjaxNavigate$convertRegularURLtoMDSURL(webUrl, fullPath) {
                if (Nav_AjaxNavigate$isMDSURL(fullPath))
                    return fullPath;
                var mdsUrl = null;

                if (webUrl != null && (fullPath.toLowerCase()).startsWith(webUrl.toLowerCase() + "/")) {
                    var webRelativeUrl = fullPath.substring(webUrl.length + 1);

                    if (webRelativeUrl == null || webRelativeUrl == "") {
                        webRelativeUrl = "/";
                    }
                    else if ('/' != webRelativeUrl[0]) {
                        webRelativeUrl = "/" + webRelativeUrl;
                    }
                    mdsUrl = Nav_AjaxNavigate$combineURL(webUrl, "/_layouts/15/start.aspx" + "#" + webRelativeUrl);
                }
                else {
                    var idxHttp = fullPath.indexOf("://");

                    if (idxHttp != -1) {
                        var idxServerPath = fullPath.indexOf("/", idxHttp + 3);

                        if (idxServerPath != -1) {
                            var serverPath = fullPath.substring(0, idxServerPath);
                            var serverRelativeUrl = fullPath.substring(idxServerPath);

                            if (serverRelativeUrl == null || serverRelativeUrl == "") {
                                serverRelativeUrl = "/";
                            }
                            else if ('/' != serverRelativeUrl[0]) {
                                serverRelativeUrl = "/" + serverRelativeUrl;
                            }
                            mdsUrl = Nav_AjaxNavigate$combineURL(serverPath, "/_layouts/15/start.aspx" + "#/" + serverRelativeUrl);
                        }
                    }
                }
                return mdsUrl;
            }
            var Nav_ajaxNavigate = new AjaxNavigate;

            Nav.ajaxNavigate = Nav_ajaxNavigate;
            Nav.convertRegularURLtoMDSURL = Nav_AjaxNavigate$convertRegularURLtoMDSURL;
            Nav.isMDSUrl = Nav_AjaxNavigate$isMDSURL;
            Nav.isPageUrlValid = Nav_IsSTSPageUrlValid;
            Nav.isPortalTemplatePage = Nav_isPortalTemplatePage;
            Nav.getAjaxLocationWindow = Nav_AjaxNavigate$_getAjaxLocationWindow;
            Nav.getSource = Nav_GetSource;
            Nav.getUrlKeyValue = Nav_GetUrlKeyValue;
            Nav.getWindowLocationNoHash = Nav_AjaxNavigate$_GetWindowLocationNoHash;
            Nav.goToHistoryLink = Nav_GoToHistoryLink;
            Nav.getGoToLinkUrl = Nav_GetGotoLinkUrl;
            Nav.goToLink = Nav_GoToLink;
            Nav.goToLinkOrDialogNewWindow = Nav_GoToLinkOrDialogNewWindow;
            Nav.goToDiscussion = Nav_GoToDiscussion;
            Nav.onClickHook = Nav_AjaxNavigate$OnClickHook;
            Nav.pageUrlValidation = Nav_PageUrlValidation;
            Nav.parseHash = Nav_AjaxNavigate$parseHash;
            Nav.navigate = Nav_STSNavigate;
            Nav.removeMDSQueryParametersFromUrl = Nav_RemoveMDSQueryParametersFromUrl;
            Nav.urlFromHashBag = Nav_AjaxNavigate$_UrlFromHashBag;
            Nav.wantsNewTab = Nav_AjaxNavigate$WantsNewTab;
            function Nav_STSNavigate(Url) {
                Url = URI.getAbsolute(Url);
                if ((Nav.ajaxNavigate.get_search()).indexOf("IsDlg=1") != -1) {
                    if (Url.indexOf("?") != -1) {
                        if (String(Url.match(RegExp("&$"))) != "&") {
                            Url = Url + "&IsDlg=1";
                        }
                        else {
                            Url = Url + "IsDlg=1";
                        }
                    }
                    else {
                        Url = Url + "?IsDlg=1";
                    }
                }
                if (window.frameElement != null || typeof SPUpdatePage === 'undefined' || typeof SPUpdatePage !== 'undefined' && SPUpdatePage(Url)) {
                    if (Nav_isPortalTemplatePage(Url))
                        window.top.location.href = Nav.pageUrlValidation(Url);
                    else
                        window.location.href = Nav.pageUrlValidation(Url);
                }
            }
            function Nav_isPortalTemplatePage(Url) {
                if (Nav.getUrlKeyValue("PortalTemplate") == "1" || Nav.getUrlKeyValue("PortalTemplate", Boolean(Url)) == "1" || typeof currentCtx != "undefined" && currentCtx != null && typeof currentCtx.isPortalTemplate != "undefined" && Boolean(currentCtx.isPortalTemplate))
                    return true;
                else
                    return false;
            }
            function Nav_GetUrlKeyValue(keyName, bNoDecode, url, bCaseInsensitive) {
                var keyValue = "";

                if (url == null)
                    url = Nav.ajaxNavigate.get_href() + "";
                var ndx;

                ndx = url.indexOf("#");
                if (ndx >= 0) {
                    url = url.substr(0, ndx);
                }
                var urlToSearchKeyIn;

                if (bCaseInsensitive) {
                    keyName = keyName.toLowerCase();
                    urlToSearchKeyIn = url.toLowerCase();
                }
                else {
                    urlToSearchKeyIn = url;
                }
                ndx = urlToSearchKeyIn.indexOf("&" + keyName + "=");
                if (ndx == -1)
                    ndx = urlToSearchKeyIn.indexOf("?" + keyName + "=");
                if (ndx != -1) {
                    var ndx2 = url.indexOf("&", ndx + 1);

                    if (ndx2 == -1)
                        ndx2 = url.length;
                    keyValue = url.substring(ndx + keyName.length + 2, ndx2);
                }
                if (bNoDecode)
                    return keyValue;
                else
                    return URI.decodeURIComponent(keyValue);
            }
            function Nav_IsSTSPageUrlValid(url) {
                return url.substr(0, 4) == "http" || url.substr(0, 1) == "/" || url.indexOf(":") == -1;
            }
            function Nav_PageUrlValidation(url, alertString) {
                if (Nav_IsSTSPageUrlValid(url)) {
                    return url;
                }
                else {
                    if (Boolean(alertString)) {
                        alert(alertString);
                    }
                    (function() {
                        if (!false) {
                            if (confirm("Assertion failed: " + "URL failed validation." + ". Break into debugger?"))
                                eval("debugger");
                        }
                    })();
                    return "";
                }
            }
            function Nav_GoToHistoryLink(elm, strVersion) {
                if (elm.href == null)
                    return;
                var targetUrl = elm.href;
                var ch = elm.href.indexOf("?") >= 0 ? "&" : "?";
                var srcUrl = ch + "VersionNo=" + strVersion;
                var srcSourceUrl = Nav.getSource();

                if (srcSourceUrl != null && srcSourceUrl != "")
                    srcSourceUrl = "&" + "Source=" + srcSourceUrl;
                targetUrl = elm.href + srcUrl + srcSourceUrl;
                if (Nav_isPortalTemplatePage(targetUrl))
                    window.top.location.href = Nav.pageUrlValidation(targetUrl);
                else
                    window.location.href = Nav.pageUrlValidation(targetUrl);
            }
            function Nav_GetGotoLinkUrl(elm) {
                if (elm.href == null)
                    return null;
                var ch = elm.href.indexOf("?") >= 0 ? "&" : "?";
                var srcUrl = Nav.getSource();

                if (srcUrl != null && srcUrl != "")
                    srcUrl = ch + "Source=" + srcUrl;
                var targetUrl = elm.href + srcUrl;

                return targetUrl;
            }
            function Nav_GoToLink(elm) {
                var targetUrl = Nav_GetGotoLinkUrl(elm);

                if (targetUrl == null)
                    return;
                if (elm.target === "_blank") {
                    window.open(targetUrl, "_blank");
                    return;
                }
                var fNavigate = true;

                if (typeof window.top.SPUpdatePage !== 'undefined') {
                    fNavigate = window.top.SPUpdatePage(targetUrl);
                }
                if (fNavigate) {
                    if (Nav_isPortalTemplatePage(targetUrl))
                        window.top.location.href = Nav.pageUrlValidation(targetUrl);
                    else
                        window.location.href = Nav.pageUrlValidation(targetUrl);
                }
            }
            function Nav_GoToLinkOrDialogNewWindow(elm) {
                if (elm.href == null)
                    return;
                if (Boolean((Nav.ajaxNavigate.get_search()).match(RegExp("[?&]IsDlg=1"))))
                    window.open(elm.href);
                else
                    Nav_GoToLink(elm);
            }
            function Nav_GoToDiscussion(url) {
                var ch = url.indexOf("?") >= 0 ? "&" : "?";
                var srcUrl = Nav.getSource();

                if (srcUrl != null && srcUrl != "")
                    url += ch + "TopicsView=" + srcUrl;
                Nav.navigate(url);
            }
            function Nav_GetSource(defaultSource) {
                if (typeof GetSource2 == "function") {
                    return URI_Encoding.encodeURIComponent(GetSource2(defaultSource, null));
                }
                var source = Nav.getUrlKeyValue("Source");

                if (source == "") {
                    if (defaultSource != null && defaultSource != "")
                        source = defaultSource;
                    else
                        source = Nav.ajaxNavigate.get_href();
                }
                return URI_Encoding.encodeURIComponent(Nav.pageUrlValidation(source));
            }
        }
        var ListModule_afterglass = {
            "__namespace": true
        };

        ListModule_afterglass_module_def();
        function ListModule_afterglass_module_def() {
            (function() {
                if (!(BrowserDetection != null)) {
                    if (confirm("Assertion failed: " + ("BrowserDetection" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            (function() {
                if (!(CSSUtil != null)) {
                    if (confirm("Assertion failed: " + ("CSSUtil" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            (function() {
                if (!(DOM != null)) {
                    if (confirm("Assertion failed: " + ("DOM" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            (function() {
                if (!(ListModule != null)) {
                    if (confirm("Assertion failed: " + ("ListModule" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            (function() {
                if (!(ListModule.Util != null)) {
                    if (confirm("Assertion failed: " + ("ListModule.Util" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            (function() {
                if (!(Nav != null)) {
                    if (confirm("Assertion failed: " + ("Nav" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            (function() {
                if (!(TypeUtil != null)) {
                    if (confirm("Assertion failed: " + ("TypeUtil" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            (function() {
                if (!(URI != null)) {
                    if (confirm("Assertion failed: " + ("URI" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            (function() {
                if (!(URI_Encoding != null)) {
                    if (confirm("Assertion failed: " + ("URI_Encoding" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            (function() {
                if (!(ContextMenu != null)) {
                    if (confirm("Assertion failed: " + ("ContextMenu" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ListModule.Util.countSelectedItems = List_CountSelectedItems;
            ListModule.Util.countTotalItems = List_CountTotalItems;
            ListModule.Util.createAjaxMenu = List_CreateAjaxMenu;
            ListModule.Util.ctxFromElement = List_CtxFromElement;
            ListModule.Util.fetchEcbInfo = List_FetchEcbInfo;
            ListModule.Util.findSTSMenuTable = List_FindSTSMenuTable;
            ListModule.Util.focusRow = List_FocusRow;
            ListModule.Util.getEcbDivFromEcbTd = List_GetEcbDivFromEcbTd;
            ListModule.Util.getEcbTdFromRow = List_GetEcbTdFromRow;
            ListModule.Util.getItemRowCbx = List_GetItemRowCbx;
            ListModule.Util.getLastSelectableRowIdx = List_GetLastSelectableRowIdx;
            ListModule.Util.getRootFolder = List_GetRootFolder;
            ListModule.Util.getRootFolder2 = List_GetRootFolder2;
            ListModule.Util.getUrlWithNoSortParameters = List_GetUrlWithNoSortParameters;
            ListModule.Util.groupNameFromRow = List_GroupNameFromRow;
            ListModule.Util.groupStringFromGroupName = List_GroupStringFromGroupName;
            ListModule.Util.headerMenuMouseDown = List_HeaderMenuMouseDown;
            ListModule.Util.itemHasIid = List_ItemHasiid;
            ListModule.Util.itemIsCurrentlySelected = List_ItemIsCurrentlySelected;
            ListModule.Util.itemIsCurrentlyVisible = List_ItemIsCurrentlyVisible;
            ListModule.Util.itemIsSelectable = List_ItemIsSelectable;
            ListModule.Util.onItemSelectionChanged = List_OnItemSelectionChanged;
            ListModule.Util.reconcileQstringFilters = List_ReconcileQstringFilters;
            ListModule.Util.selectListItem = List_SelectListItem;
            ListModule.Util.setFocusOnRowDelayed = List_SetFocusOnRowDelayed;
            ListModule.Util.showEcbMenuForTr = List_ShowECBMenuForTr;
            ListModule.Util.toggleItemRowSelection2 = List_ToggleItemRowSelection2;
            ListModule.Util.updateCtxLastSelectableRow = List_UpdateCtxLastSelectableRow;
            ListModule.Util.updateSelectAllCbx = List_UpdateSelectAllCbx;
            ListModule.Util.Qstring = List_QstringStruct;
            function List_GetRootFolder2(ctxt) {
                var RootFolder = Nav.getUrlKeyValue("RootFolder", false);
                var clvp = ctxt.clvp;

                if (clvp != null && clvp.rootFolder != null)
                    RootFolder = clvp.rootFolder;
                if (RootFolder == "" || typeof bValidSearchTerm != 'undefined' && bValidSearchTerm) {
                    var FileDirRef;

                    if (typeof itemTable != "undefined" && itemTable != null)
                        FileDirRef = ListModule.Util.getAttributeFromItemTable(itemTable, "DRef", "FileDirRef");
                    if (FileDirRef != null && FileDirRef != "") {
                        if (FileDirRef.substring(0, 1) == "/")
                            RootFolder = FileDirRef;
                        else
                            RootFolder = "/" + FileDirRef;
                    }
                    else
                        RootFolder = ctxt.listUrlDir;
                }
                return RootFolder;
            }
            function List_GetRootFolder(ctxt) {
                var RootFolder = List_GetRootFolder2(ctxt);

                return "&RootFolder=" + URI_Encoding.encodeURIComponent(RootFolder);
            }
            function List_GroupStringFromGroupName(strGroupName) {
                if (strGroupName == null || strGroupName == "")
                    return null;
                var ele = document.getElementById("titl" + strGroupName + "_");

                if (ele == null)
                    return null;
                var strGroupString = ele.getAttribute("groupString");

                return strGroupString != "" ? strGroupString : null;
            }
            function List_QstringStruct(strQuery) {
                if (strQuery == null) {
                    strQuery = "";
                }
                if (strQuery.indexOf("?") == 0) {
                    strQuery = strQuery.substring(1);
                }
                this.nonFilterParams = {};
                this.filterParams = {};
                var params = strQuery.split("&");
                var i;

                for (i = 0; i < params.length; i++) {
                    var param = params[i];
                    var keyval = param.split("=");

                    if (keyval.length == 2) {
                        if (keyval[0].search("^Filter") != -1) {
                            var fieldNumber = keyval[0].match(new RegExp("[0-9]*$"));
                            var filter;

                            if (typeof this.filterParams[fieldNumber] != "undefined") {
                                filter = this.filterParams[fieldNumber];
                            }
                            else {
                                filter = new Object();
                                this.filterParams[fieldNumber] = filter;
                            }
                            var fieldName = keyval[0].match(new RegExp("^Filter[^0-9]*"));

                            filter[fieldName] = keyval[1];
                        }
                        else {
                            this.nonFilterParams[keyval[0]] = keyval[1];
                        }
                    }
                }
            }
            List_QstringStruct.prototype.filterParams = {};
            List_QstringStruct.prototype.nonFilterParams = {};
            List_QstringStruct.prototype.toArray = List_QstringStructToArray;
            function List_QstringStructToArray() {
                var output = [];
                var key;
                var keyValuePair;
                var filterIdx = 1;
                var filterParams_length = typeof this.filterParams.length == "number" ? this.filterParams.length : 0;

                for (key in this.filterParams) {
                    var filter = this.filterParams[key];

                    for (key in filter) {
                        keyValuePair = [];
                        keyValuePair.push(key);
                        keyValuePair.push(filterIdx);
                        keyValuePair.push("=");
                        keyValuePair.push(filter[key]);
                        output.push(keyValuePair.join(""));
                    }
                    filterIdx++;
                }
                for (key in this.nonFilterParams) {
                    keyValuePair = [];
                    keyValuePair.push(key);
                    keyValuePair.push("=");
                    keyValuePair.push(this.nonFilterParams[key]);
                    output.push(keyValuePair.join(""));
                }
                return output;
            }
            List_QstringStruct.prototype.toString = List_QstringStructToString;
            function List_QstringStructToString() {
                var output = this.toArray();

                return "?" + output.join("&");
            }
            function Diff() {
            }
            Diff.prototype = {
                left: [],
                right: []
            };
            List_QstringStruct.Diff = function(strLeft, strRight) {
                var rgLeft = (new List_QstringStruct(strLeft)).toArray();
                var rgRight = (new List_QstringStruct(strRight)).toArray();
                var temp = {};
                var ret = new Diff;
                var i;

                for (i = 0; i < rgLeft.length; i++) {
                    temp[rgLeft[i]] |= 1;
                }
                for (i = 0; i < rgRight.length; i++) {
                    temp[rgRight[i]] |= 2;
                }
                for (var key in temp) {
                    if (temp[key] == 1) {
                        ret.left.push(key);
                    }
                    else if (temp[key] == 2) {
                        ret.right.push(key);
                    }
                }
                return ret;
            };
            function List_ReconcileQstringFilters(strUrl1, strUrl2) {
                var qUrls = [];

                qUrls.push(new List_QstringStruct(strUrl1));
                qUrls.push(new List_QstringStruct(strUrl2));
                var output = [];
                var i, j;
                var key;
                var keyValuePair;

                for (i = 0; i < qUrls.length; i++) {
                    for (key in qUrls[i].nonFilterParams) {
                        if (i == 0 || typeof qUrls[0].nonFilterParams[key] == 'undefined' && i == 1) {
                            keyValuePair = [];
                            keyValuePair.push(key);
                            keyValuePair.push("=");
                            keyValuePair.push(qUrls[i].nonFilterParams[key]);
                            output.push(keyValuePair.join(""));
                        }
                    }
                }
                var filterIdx = 1;
                var trackEachFilterFieldName = new Object();

                for (i = 0; i < qUrls.length; i++) {
                    for (j in qUrls[i].filterParams) {
                        var filter = qUrls[i].filterParams[j];
                        var filter_FilterField = typeof filter.FilterField == "string" ? filter.FilterField : null;

                        if (filter_FilterField == null)
                            filter_FilterField = typeof filter.FilterFields == "string" ? filter.FilterFields : null;
                        if (filter_FilterField != null && typeof trackEachFilterFieldName[filter_FilterField] == 'undefined') {
                            for (key in filter) {
                                keyValuePair = [];
                                keyValuePair.push(key);
                                keyValuePair.push(filterIdx);
                                keyValuePair.push("=");
                                keyValuePair.push(filter[key]);
                                output.push(keyValuePair.join(""));
                            }
                            filterIdx++;
                            trackEachFilterFieldName[filter.FilterField] = filter;
                        }
                    }
                }
                return output.join("&");
            }
            function List_CountTotalItems(ctxCur) {
                if (ctxCur.TotalListItems == null)
                    ctxCur.TotalListItems = 0;
                return ctxCur.TotalListItems;
            }
            function List_CountSelectedItems(ctxCur) {
                if (ctxCur.CurrentSelectedItems == null)
                    ctxCur.CurrentSelectedItems = 0;
                return ctxCur.CurrentSelectedItems;
            }
            function List_GetLastSelectableRowIdx(elt, fn) {
                if (elt == null || fn == null)
                    return -1;
                var lastRowIdx;
                var rows = elt.rows;

                for (lastRowIdx = rows.length - 1; lastRowIdx >= 0; lastRowIdx--) {
                    var row = rows[lastRowIdx];

                    if (Boolean(fn(row)))
                        return lastRowIdx;
                }
                return -1;
            }
            function List_UpdateCtxLastSelectableRow(ctxCur, tab) {
                if (ctxCur == null || tab == null)
                    return;
                ctxCur.LastSelectableRowIdx = 0;
                var lastIdx = List_GetLastSelectableRowIdx(tab, List_ItemIsSelectable);

                if (lastIdx != -1)
                    ctxCur.LastSelectableRowIdx = lastIdx;
            }
            function List_ItemIsSelectable(row) {
                if (row == null || !List_ItemHasiid(row) || !List_ItemIsCurrentlyVisible(row))
                    return false;
                return true;
            }
            function List_ItemIsCurrentlyVisible(row) {
                if (row == null || row.parentNode == null)
                    return false;
                if (CSSUtil.getCurrentStyle(row.parentNode, "display") == "none" || CSSUtil.getCurrentStyle(row, "display") == "none")
                    return false;
                return true;
            }
            function List_ItemIsCurrentlySelected(ctxCur, iid, row) {
                if (ctxCur == null || !Boolean(iid))
                    return false;
                var dictSel = ListModule.Util.getSelectedItemsDict(ctxCur);

                if (dictSel == null || dictSel[iid] == null || row.className.indexOf("s4-itm-selected") < 0)
                    return false;
                return true;
            }
            function List_ItemHasiid(row) {
                if (row == null || row.getAttribute("iid") == null)
                    return false;
                return true;
            }
            function List_HeaderMenuMouseDown(headerCell) {
                if (headerCell != null && headerCell.tagName == "TH") {
                    if (CSSUtil.HasClass(headerCell, "ms-headerCellStyleHover")) {
                        CSSUtil.RemoveClass(headerCell, "ms-headerCellStyleHover");
                        CSSUtil.AddClass(headerCell, "ms-headerCellStylePressed");
                    }
                }
            }
            function List_CtxFromElement(srcElement) {
                if (typeof standaloneCtx != 'undefined') {
                    return standaloneCtx;
                }
                return null;
            }
            function List_FindSTSMenuTable(elm, strSearch) {
                var str = elm.getAttribute(strSearch);

                while (elm != null && (str == null || str == "")) {
                    elm = DOM_afterglass.GetSelectedElement(elm.parentNode, "TABLE", "DIV");
                    if (elm != null)
                        str = elm.getAttribute(strSearch);
                }
                return elm;
            }
            function List_GetUrlWithNoSortParameters(strSortFields) {
                var url = Nav.ajaxNavigate.get_href();
                var uri = new URI(url, {
                    disableEncodingDecodingForLegacyCode: true
                });

                uri.setFragment("");
                url = uri.getString();
                var strT;
                var ichStart = 0;
                var ichEqual;
                var ichAmp;

                do {
                    ichEqual = strSortFields.indexOf("=", ichStart);
                    if (ichEqual == -1)
                        return url;
                    strT = strSortFields.substring(ichStart, ichEqual);
                    if (strT != "")
                        url = URI.removeQueryParameter(url, strT);
                    if (typeof strT == "string" && strT.length > "FilterField".length && strT.substring(0, "FilterField".length) == "FilterField") {
                        var filterFieldNumString = strT.substring("FilterField".length);

                        url = URI.removeQueryParameter(url, "FilterValue" + filterFieldNumString);
                        url = URI.removeQueryParameter(url, "FilterLookupId" + filterFieldNumString);
                        url = URI.removeQueryParameter(url, "FilterOp" + filterFieldNumString);
                        url = URI.removeQueryParameter(url, "FilterData" + filterFieldNumString);
                    }
                    ichAmp = strSortFields.indexOf("&", ichEqual + 1);
                    if (ichAmp == -1)
                        return url;
                    ichStart = ichAmp + 1;
                } while (strT != "");
                return url;
            }
            function List_ToggleItemRowSelection2(ctxCur, tr, fSelect, fUpdateRibbon, dontSetFocus) {
                var iid = tr.getAttribute("iid");
                var rgiid = iid.split(",");

                if (rgiid[1] == "")
                    return false;
                List_SelectListItem(ctxCur, iid, rgiid, tr, fSelect, dontSetFocus);
                List_OnItemSelectionChanged(ctxCur, List_GroupNameFromRow(tr), fUpdateRibbon);
                return true;
            }
            function List_SelectListItem(ctxArg, iid, rgiid, tr, fSelect, dontSetFocus) {
                var cbx = List_GetItemRowCbx(tr);

                if (cbx == null) {
                    return;
                }
                cbx.checked = fSelect;
                if (typeof ctxArg.dictSel == "undefined")
                    ctxArg.dictSel = [];
                if (fSelect) {
                    CSSUtil.AddClass(tr, "s4-itm-selected");
                    if (ctxArg.dictSel[iid] == null) {
                        ctxArg.CurrentSelectedItems++;
                        ctxArg.dictSel[iid] = {
                            id: rgiid[1],
                            fsObjType: rgiid[2]
                        };
                    }
                    if (cbx.nodeName.toUpperCase() != 'INPUT') {
                        cbx.setAttribute('aria-checked', "true");
                    }
                }
                else {
                    CSSUtil.RemoveClass(tr, "s4-itm-selected");
                    if (ctxArg.dictSel[iid] != null) {
                        delete ctxArg.dictSel[iid];
                        ctxArg.CurrentSelectedItems--;
                    }
                    if (cbx.nodeName.toUpperCase() != 'INPUT') {
                        cbx.setAttribute('aria-checked', "false");
                    }
                }
                if (!dontSetFocus) {
                    List_FocusRow(ctxArg, iid, tr);
                }
            }
            function List_GetItemRowCbx(tr) {
                var cbx = null;

                if (tr != null && tr.cells != null && tr.cells.length > 0) {
                    var c = tr.cells[0];

                    cbx = c.querySelector(".s4-itm-cbx");
                }
                return cbx;
            }
            function List_FocusRow(ctxArg, iid, tr) {
                if (ctxArg == null)
                    return;
                ctxArg.LastSelectedItemIID = iid;
                var cbx = List_GetItemRowCbx(tr);

                if (cbx != null) {
                    if (ctxArg.RowFocusTimerID != null) {
                        clearTimeout(ctxArg.RowFocusTimerID);
                    }
                    ctxArg.RowFocusTimerID = setTimeout(function() {
                        List_SetFocusOnRowDelayed(ctxArg, cbx);
                    }, 11);
                }
            }
            function List_OnItemSelectionChanged(ctxArg, strGroupName, bUpdateRibbon) {
                var ctxCur = ctxArg;

                function _clvpsInited() {
                    var args = [];

                    if (typeof _ribbon != 'undefined' && _ribbon != null) {
                        var clvp = ctxCur.clvp;

                        if (clvp != null) {
                            clvp.EnsureEcbInfo(null, null, strGroupName);
                        }
                    }
                }
                _clvpsInited();
            }
            function List_GroupNameFromRow(tr) {
                var parentNode = tr.parentNode;
                var str = parentNode.id;

                if (str == null || str == "") {
                    var siblingNode = parentNode.previousSibling;

                    if (siblingNode != null && siblingNode.childNodes.length == 0 && siblingNode.tagName == parentNode.tagName)
                        str = siblingNode.id;
                }
                if (str == null || str == "")
                    return null;
                var strGroupName = str.substr(4, str.length - 6);

                return strGroupName != "" ? strGroupName : null;
            }
            function List_SetFocusOnRowDelayed(ctxArg, cbx) {
                var g_InViewPort = 1;
                var g_OutOfViewPortCloserToTop = 2;
                var g_OutOfViewPortCloserToBottom = 3;

                function ElementInViewportVertical(elm, elmParent) {
                    if (elm == null)
                        return g_InViewPort;
                    if (elmParent == null) {
                        elmParent = document.body;
                    }
                    var posTop = DOM.AbsTop(elm);
                    var posParentTop = DOM.AbsTop(elmParent);
                    var posScrollTop = elmParent.scrollTop;
                    var parentYOffset = posParentTop + posScrollTop;
                    var elmHeight = elm.offsetHeight;
                    var offsetFromTopOfParent = posTop - parentYOffset;
                    var offsetFromBottomOfParent = parentYOffset + elmParent.offsetHeight - (posTop + elmHeight);

                    if (offsetFromTopOfParent >= 0 && offsetFromBottomOfParent >= 0) {
                        return g_InViewPort;
                    }
                    else {
                        return Math.abs(offsetFromTopOfParent) < Math.abs(offsetFromBottomOfParent) ? g_OutOfViewPortCloserToTop : g_OutOfViewPortCloserToBottom;
                    }
                }
                if (cbx == null || ctxArg == null)
                    return;
                try {
                    cbx.focus();
                }
                catch (e) { }
                if (BrowserDetection.userAgent.webKit) {
                    var inViewPort = ElementInViewportVertical(cbx, document.getElementById("s4-workspace"));

                    if (inViewPort != g_InViewPort) {
                        var fScrollTop = inViewPort == g_OutOfViewPortCloserToTop ? true : false;

                        cbx.scrollIntoView(fScrollTop);
                    }
                }
                ctxArg.RowFocusTimerID = null;
            }
            function List_UpdateSelectAllCbx(ctxCur, fSelect) {
                if (ctxCur == null || ctxCur.SelectAllCbx == null)
                    return;
                ctxCur.SelectAllCbx.checked = false;
                if (fSelect) {
                    var total = List_CountTotalItems(ctxCur);
                    var selectedLocal = List_CountSelectedItems(ctxCur);

                    if (selectedLocal == total && selectedLocal > 0)
                        ctxCur.SelectAllCbx.checked = true;
                }
            }
            function List_ShowECBMenuForTr(elm, evt, localizedStrings, overrideXPos, overrideYPos) {
                if (DOM_afterglass.IsEventRightClickOnAnchor(evt))
                    return true;
                var elmTr = DOM_afterglass.GetAncestor(elm, "TR");
                var elmTdEcb = List_GetEcbTdFromRow(elmTr);
                var elmDivEcb = List_GetEcbDivFromEcbTd(elmTdEcb);

                if (elmDivEcb == null)
                    return true;
                itemTable = elmDivEcb;
                var useOverridePosition = typeof overrideXPos == "number" && typeof overrideYPos == "number" && overrideXPos >= 0 && overrideYPos >= 0;

                if (!useOverridePosition) {
                    overrideXPos = (overrideYPos = undefined);
                }
                var fUseMousePosition = true;

                return List_CreateAjaxMenu(evt, fUseMousePosition, localizedStrings, overrideXPos, overrideYPos);
            }
            function List_GetEcbTdFromRow(tr) {
                var elmEcbTd = null;

                if (tr != null) {
                    elmEcbTd = tr.querySelector("td[IsECB=\"TRUE\"]");
                }
                return elmEcbTd;
            }
            function List_GetEcbDivFromEcbTd(elmEcbTd) {
                return elmEcbTd != null ? elmEcbTd.querySelector("div.ms-vb.itx") : null;
            }
            function List_CreateAjaxMenu(e, fUseMousePosition, localizedStrings, overrideXPos, overrideYPos) {
                if (e == null)
                    e = window.event;
                var srcElement = DOM.GetEventSrcElement(e);
                var ctxt = ListModule.Util.ctxFromElement();
                var evtCopy = null;

                if (typeof overrideXPos == "number" && typeof overrideYPos == "number" && overrideXPos >= 0 && overrideYPos >= 0) {
                    evtCopy = new Object();
                    evtCopy.clientX = overrideXPos;
                    evtCopy.clientY = overrideYPos;
                }
                else if (fUseMousePosition && e != null && e.clientX != null && e.clientY != null && e.clientX != 0 && e.clientY != 0) {
                    evtCopy = new Object();
                    evtCopy.clientX = e.clientX;
                    evtCopy.clientY = e.clientY;
                }
                var fn = function(ctxt2, tab) {
                    (function() {
                        if (!(tab != null)) {
                            if (confirm("Assertion failed: " + "expected valid row info for menu items." + ". Break into debugger?"))
                                eval("debugger");
                        }
                    })();
                    ;
                    (function() {
                        if (!ctxt2.IsClientRendering) {
                            if (confirm("Assertion failed: " + "modular list view only supports client rendering" + ". Break into debugger?"))
                                eval("debugger");
                        }
                    })();
                    ;
                    var menu = new ContextMenu({
                        evt: evtCopy,
                        items: [{
                            'text': 'View Item',
                            'href': ListModule.Util.createViewEditUrl(ctxt2, tab, false, true)
                        }, {
                            'text': 'Edit Item',
                            'href': ListModule.Util.createViewEditUrl(ctxt2, tab, true, true)
                        }]
                    });

                    menu.open();
                };

                List_FetchEcbInfo(ctxt, itemTable.id, itemTable.tagName, fn);
                e.cancelBubble = true;
                return false;
            }
            function List_FetchEcbInfo(ctxt, id, tagName, fnCallback) {
                var rg = [];
                var hasCustomAction = false;
                var str = URI_Encoding.escapeUrlForCallback(ctxt.HttpRoot);

                rg.push(str);
                if (str[str.length - 1] != "/")
                    rg.push("/");
                rg.push("_layouts/15/inplview.aspx?Cmd=Ctx&List=");
                rg.push(ctxt.listName);
                if (ctxt.HasRelatedCascadeLists == 1 && ctxt.CascadeDeleteWarningMessage == null) {
                    rg.push("&CascDelWarnMessage=1");
                }
                if (ctxt.view != null) {
                    rg.push("&View=");
                    rg.push(ctxt.view);
                }
                rg.push("&ViewCount=");
                rg.push(ctxt.ctxId);
                if (typeof ctxt.isXslView != "undefined" && ctxt.isXslView) {
                    rg.push("&IsXslView=TRUE");
                    rg.push("&Field=");
                    if (itemTable != null)
                        rg.push(ListModule.Util.getAttributeFromItemTable(itemTable, "Field", "Field"));
                    else
                        rg.push("LinkFilename");
                    if (typeof ctxt.IsClientRendering != "undefined" && ctxt.IsClientRendering) {
                        rg.push("&IsCSR=TRUE");
                        if (Boolean(ctxt.listName)) {
                            var ecbId = "ECBItems_" + ctxt.listName.toLowerCase();

                            ;
                            if (document.getElementById(ecbId) == null) {
                                rg.push("&CustomAction=TRUE");
                                hasCustomAction = true;
                            }
                            else if (Boolean(ctxt.ExternalDataList)) {
                                CallBackWithRowData(ctxt, id, ctxt.ListData, fnCallback);
                                return;
                            }
                        }
                    }
                }
                rg.push("&ID=");
                rg.push(id);
                var strRoot = Nav.getUrlKeyValue("RootFolder", true, Nav.ajaxNavigate.get_href());

                if (strRoot.length > 0) {
                    rg.push("&RootFolder=");
                    rg.push(strRoot);
                }
                rg.push("&ListViewPageUrl=");
                var uri = new URI(Nav.ajaxNavigate.get_href(), {
                    disableEncodingDecodingForLegacyCode: true
                });

                str = uri.getStringWithoutQueryAndFragment();
                rg.push(str);
                if (typeof ctxt.overrideScope != "undefined") {
                    rg.push("&OverrideScope=");
                    rg.push(URI_Encoding.encodeURIComponent(ctxt.overrideScope));
                }
                if (typeof ctxt.searchTerm != "undefined" && ctxt.searchTerm != null) {
                    rg.push("&InplaceSearchQuery=");
                    rg.push(URI_Encoding.encodeURIComponent(ctxt.searchTerm, true));
                }
                else if (typeof ctxt.completedSearchTerm != "undefined" && ctxt.completedSearchTerm != null) {
                    rg.push("&InplaceSearchQuery=");
                    rg.push(URI_Encoding.encodeURIComponent(ctxt.completedSearchTerm, true));
                }
                if (typeof ctxt.fullListSearch != "undefined" && ctxt.fullListSearch != null && ctxt.fullListSearch == true) {
                    rg.push("&InplaceFullListSearch=true");
                }
                var strUrl = rg.join("");
                var req;
                var xmlHttpCtr = XMLHttpRequest;

                if (ctxt.clvp != null && ctxt.clvp.xmlHttpCtr != null) {
                    xmlHttpCtr = ctxt.clvp.xmlHttpCtr;
                }
                req = new xmlHttpCtr();
                req.open("POST", strUrl, true);
                req.onreadystatechange = function() {
                    if (req.readyState != 4)
                        return;
                    if (req.status == 601) {
                        alert(req.responseText);
                    }
                    else if (req.status == 503) {
                        (function() {
                            if (!false) {
                                if (confirm("Assertion failed: " + "server busy" + ". Break into debugger?"))
                                    eval("debugger");
                            }
                        })();
                        ;
                    }
                    else {
                        if (typeof ctxt.IsClientRendering != "undefined" && ctxt.IsClientRendering) {
                            var strEcb = req.responseText;

                            if (hasCustomAction) {
                                var strCustomAction = '<CustomAction/>';
                                var index = strEcb.indexOf(strCustomAction);

                                if (index >= 0) {
                                    var ecbDiv = document.createElement("DIV");

                                    ecbDiv.innerHTML = strEcb.substring(0, index);
                                    document.body.appendChild(ecbDiv);
                                    strEcb = strEcb.substring(index + strCustomAction.length);
                                }
                            }
                            var newListData = null;

                            if (Boolean(ctxt.ExternalDataList)) {
                                newListData = ctxt.ListData;
                            }
                            else {
                                newListData = JSON.parse(strEcb);
                            }
                            if (ctxt.HasRelatedCascadeLists == 1 && ctxt.CascadeDeleteWarningMessage == null) {
                                ctxt.CascadeDeleteWarningMessage = newListData.CascadeDeleteWarningMessage;
                            }
                            CallBackWithRowData(ctxt, id, newListData, fnCallback);
                        }
                        else {
                            (function() {
                                if (!false) {
                                    if (confirm("Assertion failed: " + "modular view only supports client rendering." + ". Break into debugger?"))
                                        eval("debugger");
                                }
                            })();
                            ;
                        }
                    }
                };
                req.send(null);
                function CallBackWithRowData(ctxt2, id2, listData, fnCallback2) {
                    var i;
                    var rowData = undefined;

                    for (i = 0; i < listData.Row.length; i++) {
                        if (listData.Row[i].ID == id2) {
                            rowData = listData.Row[i];
                            break;
                        }
                    }
                    if (rowData != undefined)
                        fnCallback2(ctxt2, rowData);
                }
            }
        }
        window.Renderer = Renderer;
        window.ListModule = ListModule;
        function $get(id) {
            return document.getElementById(id);
        }
        function $addHandler(element, eventName, handler) {
            if (element.addEventListener) {
                element.addEventListener(eventName, handler, false);
            }
            else {
                (function() {
                    if (!Boolean(element.attachEvent)) {
                        if (confirm("Assertion failed: " + "attachEvent must be defined if addEventListener is not" + ". Break into debugger?"))
                            eval("debugger");
                    }
                })();
                ;
                element.attachEvent('on' + eventName, handler);
            }
        }
        Array.addRange = function(array, items) {
            array.push.apply(array, items);
        };
        Number.parseInvariant = function(num) {
            return parseInt(num, 10);
        };
        String.format = function() {
            var args = Array.prototype.slice.call(arguments);
            var formatString = args.shift();
            var result = [];
            var start = 0;
            var onePastEnd = 0;

            (function() {
                if (!(formatString.indexOf("{{") == -1 && formatString.indexOf("}}") == -1)) {
                    if (confirm("Assertion failed: " + "does not yet handle {{ or }}" + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            while ((start = formatString.indexOf("{", start)) >= 0) {
                if (onePastEnd < start)
                    result.push(formatString.slice(onePastEnd, start));
                var end = formatString.indexOf("}", start);
                var innerTemplate = formatString.slice(start + 1, end);
                var replacementIdx = parseInt(innerTemplate, 10);
                var replacementToken = args[replacementIdx];

                result.push(replacementToken);
                onePastEnd = end + 1;
                start = onePastEnd;
            }
            if (onePastEnd < formatString.length)
                result.push(formatString.substr(onePastEnd));
            return result.join('');
        };
        function GetString(x) {
            return typeof ListView.Strings == "undefined" ? ListViewDefaults.Strings[x] : ListView.Strings[x];
        }
        function GetThemedImageUrl(x) {
            return ListView.ImageBasePath + '/_layouts/15/images/' + x;
        }
        var clientHierarchyManagers = [];

        function OnExpandCollapseButtonClick(e) {
            for (var i = 0; i < clientHierarchyManagers.length; i++) {
                clientHierarchyManagers[i].ToggleExpandByImg(e.target.parentNode);
            }
            e.stopPropagation();
        }
        function GetClientHierarchyManagerForWebpart(wpq, bRtl) {
            for (var idx = 0; idx < clientHierarchyManagers.length; idx++) {
                if (clientHierarchyManagers[idx].Matches(wpq)) {
                    return clientHierarchyManagers[idx];
                }
            }
            return new ClientHierarchyManager(wpq, bRtl);
        }
        var ClientHierarchyManager = function(wpq, bRtl) {
            clientHierarchyManagers.push(this);
            var _wpq = wpq;
            var _expandedState = {};
            var _itemIdToTrIdMap = {};
            var _imgToItemIdMap = {};
            var _childrenMap = {};
            var _itemIdToImgIdMap = {};

            this.Matches = function(wpqToMatch) {
                return wpqToMatch == _wpq;
            };
            this.RegisterHierarchyNode = function(itemId, parentId, trId, imgId) {
                _expandedState[itemId] = true;
                _itemIdToTrIdMap[itemId] = trId;
                _imgToItemIdMap[imgId] = itemId;
                _itemIdToImgIdMap[itemId] = imgId;
                _childrenMap[itemId] = [];
                if (parentId != null) {
                    _childrenMap[parentId].push(itemId);
                }
            };
            this.IsParent = function(itemId) {
                return itemId in _childrenMap && _childrenMap[itemId].length > 0;
            };
            this.ToggleExpandByImg = function(img) {
                if (!(img.id in _imgToItemIdMap)) {
                    return;
                }
                var itemId = _imgToItemIdMap[img.id];

                ToggleExpand(itemId, img);
            };
            this.ToggleExpandById = function(itemId) {
                if (itemId == null) {
                    return;
                }
                if (!(itemId in _itemIdToImgIdMap)) {
                    return;
                }
                var imgId = _itemIdToImgIdMap[itemId];
                var img = $get(imgId);

                if (img == null) {
                    return;
                }
                ToggleExpand(itemId, img);
            };
            this.GetToggleStateById = function(itemId) {
                if (itemId == null) {
                    return 0;
                }
                if (!(itemId in _expandedState)) {
                    return 0;
                }
                if (_childrenMap[itemId].length == 0) {
                    return 0;
                }
                return _expandedState[itemId] ? 1 : 2;
            };
            function ToggleExpand(itemId, span) {
                var bExpanding = !_expandedState[itemId];

                if (bExpanding) {
                    span.firstChild.className = 'ms-commentcollapse' + (bRtl ? 'rtl' : '') + '-icon';
                    ExpandChildren(itemId);
                }
                else {
                    span.firstChild.className = 'ms-commentexpand' + (bRtl ? 'rtl' : '') + '-icon';
                    CollapseChildren(itemId);
                }
                _expandedState[itemId] = bExpanding;
            }
            function ExpandChildren(id) {
                for (var i = 0; i < _childrenMap[id].length; i++) {
                    (document.getElementById(_itemIdToTrIdMap[_childrenMap[id][i]])).style.display = '';
                    if (_expandedState[_childrenMap[id][i]]) {
                        ExpandChildren(_childrenMap[id][i]);
                    }
                }
            }
            function CollapseChildren(id) {
                for (var i = 0; i < _childrenMap[id].length; i++) {
                    (document.getElementById(_itemIdToTrIdMap[_childrenMap[id][i]])).style.display = 'none';
                    CollapseChildren(_childrenMap[id][i]);
                }
            }
        };

        function EnterIPEAndDoAction(ctxIn, fn) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "standalone list view doesn't yet support inplview/IPE" + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function IndentItems(ctxIn) {
            EnterIPEAndDoAction(ctxIn, function(spgantt) {
                spgantt.IndentItems(spgantt.get_SelectedItems());
            });
        }
        function OutdentItems(ctxIn) {
            EnterIPEAndDoAction(ctxIn, function(spgantt) {
                spgantt.OutdentItems(spgantt.get_SelectedItems());
            });
        }
        function InsertProvisionalItem(ctxIn) {
            EnterIPEAndDoAction(ctxIn, function(spgantt) {
                spgantt.InsertProvisionalItemBeforeFocusedItem();
            });
        }
        function MoveItemsUp(ctxIn) {
            EnterIPEAndDoAction(ctxIn, function(spgantt) {
                spgantt.MoveItemsUp(spgantt.get_ContiguousSelectedItemsWithoutEntryItems());
            });
        }
        function MoveItemsDown(ctxIn) {
            EnterIPEAndDoAction(ctxIn, function(spgantt) {
                spgantt.MoveItemsDown(spgantt.get_ContiguousSelectedItemsWithoutEntryItems());
            });
        }
        function CreateSubItem(ctxIn, itemId) {
            EnterIPEAndDoAction(ctxIn, function(spgantt) {
                spgantt.CreateSubItem(itemId);
            });
        }
        if (window["ClientPivotControl"] == null) {
            var ClientPivotControl = function(controlProps) {
                this.AllOptions = [];
                if (controlProps != null) {
                    this.PivotParentId = controlProps.PivotParentId;
                    this.PivotContainerId = controlProps.PivotContainerId;
                    if (typeof controlProps.AllOptions != "undefined")
                        this.AllOptions = controlProps.AllOptions;
                    if (typeof controlProps.SurfacedPivotCount == "number")
                        this.SurfacedPivotCount = Number(controlProps.SurfacedPivotCount);
                    if (typeof controlProps.ShowMenuIcons != "undefined")
                        this.ShowMenuIcons = Boolean(controlProps.ShowMenuIcons);
                    if (typeof controlProps.ShowMenuClose != "undefined")
                        this.ShowMenuClose = controlProps.ShowMenuClose;
                    if (typeof controlProps.ShowMenuCheckboxes != "undefined")
                        this.ShowMenuCheckboxes = controlProps.ShowMenuCheckboxes;
                    if (typeof controlProps.Width != "undefined")
                        this.Width = controlProps.Width;
                }
                else {
                    this.PivotContainerId = 'clientPivotControl' + ClientPivotControl.PivotControlCount.toString();
                }
                this.OverflowDotId = this.PivotContainerId + '_overflow';
                this.OverflowMenuId = this.PivotContainerId + '_menu';
                ClientPivotControl.PivotControlCount++;
                ClientPivotControl.PivotControlDict[this.PivotContainerId] = this;
            };

            ClientPivotControl.PivotControlDict = [];
            ClientPivotControl.PivotControlCount = 0;
            ClientPivotControl.prototype = {
                PivotParentId: '',
                PivotContainerId: '',
                OverflowDotId: '',
                OverflowMenuId: '',
                AllOptions: [],
                SurfacedPivotCount: 3,
                ShowMenuIcons: false,
                ShowMenuClose: false,
                ShowMenuCheckboxes: false,
                OverflowMenuScript: '',
                Width: '',
                SurfacedOptions: [],
                OverflowOptions: [],
                SelectedOptionIdx: -1,
                AddMenuOption: function(option) {
                    if (ClientPivotControl.IsMenuOption(option) || ClientPivotControl.IsMenuCheckOption(option))
                        this.AllOptions.push(option);
                },
                AddMenuSeparator: function() {
                    if (this.AllOptions.length == 0)
                        return;
                    var lastItem = this.AllOptions[this.AllOptions.length - 1];

                    if (ClientPivotControl.IsMenuSeparator(lastItem))
                        return;
                    this.AllOptions.push(new ClientPivotControlMenuSeparator());
                },
                Render: function() {
                    if (this.PivotParentId == null || this.PivotParentId == '')
                        return;
                    var parentElt = document.getElementById(this.PivotParentId);

                    if (parentElt == null)
                        return;
                    parentElt.innerHTML = this.RenderAsString();
                    if (this.Width != '')
                        parentElt.style.width = this.Width;
                },
                RenderAsString: function() {
                    this.ProcessAllMenuItems();
                    this.EnsureSelectedOption();
                    var surfacedCount = this.SurfacedOptions.length;

                    if (surfacedCount == 0)
                        return '';
                    var result = [];

                    result.push('<span class="ms-pivotControl-container" id="');
                    result.push(Encoding.HtmlEncode(this.PivotContainerId));
                    result.push('">');
                    for (var idx = 0; idx < surfacedCount; idx++)
                        result.push(this.RenderSurfacedOption(idx));
                    if (this.ShouldShowOverflowMenuLink())
                        result.push(this.RenderOverflowMenuLink());
                    result.push("</span>");
                    return result.join('');
                },
                ShouldShowOverflowMenuLink: function() {
                    return false;
                },
                ShowOverflowMenu: function() {
                    (function() {
                        if (!false) {
                            if (confirm("Assertion failed: " + "Menu code not supported in standalone list view." + ". Break into debugger?"))
                                eval("debugger");
                        }
                    })();
                    ;
                },
                RenderSurfacedOption: function(optIdx) {
                    if (optIdx < 0 || optIdx >= this.SurfacedOptions.length)
                        return '';
                    var surfaceOpt = this.SurfacedOptions[optIdx];
                    var className = 'ms-pivotControl-surfacedOpt';

                    if (surfaceOpt.SelectedOption)
                        className += '-selected';
                    var optRes = [];

                    optRes.push('<a class="');
                    optRes.push(className);
                    optRes.push('" href="#" id="');
                    optRes.push(Encoding.HtmlEncode(this.PivotContainerId + '_surfaceopt' + optIdx.toString()));
                    optRes.push('" onclick="');
                    optRes.push(Encoding.HtmlEncode(surfaceOpt.OnClickAction));
                    optRes.push(' return false;" alt="');
                    optRes.push(Encoding.HtmlEncode(surfaceOpt.DisplayText));
                    optRes.push('" >');
                    optRes.push(Encoding.HtmlEncode(surfaceOpt.DisplayText));
                    optRes.push('</a>');
                    return optRes.join('');
                },
                RenderOverflowMenuLink: function() {
                    (function() {
                        if (!false) {
                            if (confirm("Assertion failed: " + "Shouldn't get here -- this code has a dependency on strings.js which shouldn't be possible at render time." + ". Break into debugger?"))
                                eval("debugger");
                        }
                    })();
                    ;
                },
                ProcessAllMenuItems: function() {
                    if (this.SurfacedPivotCount < 0)
                        this.SurfacedPivotCount = 1;
                    this.SurfacedOptions = [];
                    this.OverflowOptions = [];
                    var allOptionCount = this.AllOptions.length;

                    if (allOptionCount == 0)
                        return;
                    var optIdx = 0;
                    var trimOpts = [];

                    for (; optIdx < allOptionCount; optIdx++) {
                        var sOpt = this.AllOptions[optIdx];

                        if (ClientPivotControl.IsMenuSeparator(sOpt))
                            continue;
                        if (trimOpts.length == this.SurfacedPivotCount)
                            break;
                        trimOpts.push(sOpt);
                    }
                    this.SurfacedOptions = this.SurfacedOptions.concat(trimOpts);
                    if (optIdx != allOptionCount) {
                        for (; optIdx < allOptionCount; optIdx++)
                            this.OverflowOptions.push(this.AllOptions[optIdx]);
                        var lastMenuOpt = this.OverflowOptions[this.OverflowOptions.length - 1];

                        if (ClientPivotControl.IsMenuSeparator(lastMenuOpt))
                            this.OverflowOptions.pop();
                    }
                },
                EnsureSelectedOption: function() {
                    this.SelectedOptionIdx = -1;
                    var surfacedCount = this.SurfacedOptions.length;
                    var overflowCount = this.OverflowOptions.length;

                    if (surfacedCount == 0 && overflowCount == 0)
                        return;
                    for (var surIdx = 0; surIdx < this.SurfacedOptions.length; surIdx++) {
                        var surfacedOpt = this.SurfacedOptions[surIdx];

                        if (Boolean(surfacedOpt.SelectedOption) && this.SelectedOptionIdx == -1)
                            this.SelectedOptionIdx = surIdx;
                        else
                            surfacedOpt.SelectedOption = false;
                    }
                    for (var overIdx = 0; overIdx < this.OverflowOptions.length; overIdx++) {
                        var overflowOpt = this.OverflowOptions[overIdx];

                        if (Boolean(overflowOpt.SelectedOption) && this.SelectedOptionIdx == -1) {
                            this.SelectedOptionIdx = this.SurfacedOptions.length;
                        }
                        else {
                            if (ClientPivotControl.IsMenuOption(overflowOpt))
                                overflowOpt.SelectedOption = false;
                        }
                    }
                    if (this.SelectedOptionIdx == -1) {
                        this.SelectedOptionIdx = 0;
                        this.SurfacedOptions[0].SelectedOption = true;
                    }
                    else if (this.SelectedOptionIdx == this.SurfacedOptions.length) {
                        var shiftOpt = this.SurfacedOptions.pop();
                        var oldOverflowOpts = this.OverflowOptions;

                        this.OverflowOptions = [];
                        this.OverflowOptions.push(shiftOpt);
                        for (var i = 0; i < oldOverflowOpts.length; i++) {
                            var overflow = oldOverflowOpts[i];

                            if (Boolean(overflow.SelectedOption))
                                this.SurfacedOptions.push(overflow);
                            else
                                this.OverflowOptions.push(overflow);
                        }
                        this.SelectedOptionIdx = this.SurfacedOptions.length - 1;
                    }
                }
            };
            var ClientPivotControlExpandOverflowMenu = function(evt) {
                (function() {
                    if (!false) {
                        if (confirm("Assertion failed: " + "Menu functionality not supported in standalone list view yet." + ". Break into debugger?"))
                            eval("debugger");
                    }
                })();
                ;
            };
            var ClientPivotControl_InitStandaloneControlWrapper = function(controlProps) {
                if (controlProps == null)
                    return;
                var pivot = new ClientPivotControl(controlProps);

                pivot.Render();
            };

            ClientPivotControl.MenuOptionType = {
                MenuOption: 1,
                MenuSeparator: 2,
                MenuCheckOption: 3
            };
            ClientPivotControl.IsMenuOption = function(menuOpt) {
                return menuOpt != null && menuOpt.MenuOptionType == ClientPivotControl.MenuOptionType.MenuOption;
            };
            ClientPivotControl.IsMenuCheckOption = function(menuOpt) {
                return menuOpt != null && menuOpt.MenuOptionType == ClientPivotControl.MenuOptionType.MenuCheckOption;
            };
            ClientPivotControl.IsMenuSeparator = function(menuOpt) {
                return menuOpt != null && menuOpt.MenuOptionType == ClientPivotControl.MenuOptionType.MenuSeparator;
            };
            var ClientPivotControlMenuItem = function() {
            };

            ClientPivotControlMenuItem.prototype = {
                MenuOptionType: 0
            };
            var ClientPivotControlMenuOption = function() {
                this.MenuOptionType = ClientPivotControl.MenuOptionType.MenuOption;
            };

            ClientPivotControlMenuOption.prototype = new ClientPivotControlMenuItem();
            ClientPivotControlMenuOption.prototype.DisplayText = '';
            ClientPivotControlMenuOption.prototype.Description = '';
            ClientPivotControlMenuOption.prototype.OnClickAction = '';
            ClientPivotControlMenuOption.prototype.ImageUrl = '';
            ClientPivotControlMenuOption.prototype.ImageAltText = '';
            ClientPivotControlMenuOption.prototype.SelectedOption = false;
            var ClientPivotControlMenuSeparator = function() {
                this.MenuOptionType = ClientPivotControl.MenuOptionType.MenuSeparator;
            };

            ClientPivotControlMenuSeparator.prototype = new ClientPivotControlMenuItem();
            var ClientPivotControlMenuCheckOption = function() {
                this.MenuOptionType = ClientPivotControl.MenuOptionType.MenuCheckOption;
            };

            ClientPivotControlMenuCheckOption.prototype = new ClientPivotControlMenuItem();
            ClientPivotControlMenuCheckOption.prototype.Checked = false;
            window.ClientPivotControl = ClientPivotControl;
            window.ClientPivotControlExpandOverflowMenu = ClientPivotControlExpandOverflowMenu;
            window.ClientPivotControl_InitStandaloneControlWrapper = ClientPivotControl_InitStandaloneControlWrapper;
            window.ClientPivotControlMenuCheckOption = ClientPivotControlMenuCheckOption;
            window.ClientPivotControlMenuItem = ClientPivotControlMenuItem;
            window.ClientPivotControlMenuOption = ClientPivotControlMenuOption;
            window.ClientPivotControlMenuSeparator = ClientPivotControlMenuSeparator;
        }
        else {
            ClientPivotControl = window["ClientPivotControl"];
            ClientPivotControlExpandOverflowMenu = window["ClientPivotControlExpandOverflowMenu"];
            ClientPivotControl_InitStandaloneControlWrapper = window["ClientPivotControl_InitStandaloneControlWrapper"];
            ClientPivotControlMenuItem = window["ClientPivotControlMenuItem"];
            ClientPivotControlMenuOption = window["ClientPivotControlMenuOption"];
            ClientPivotControlMenuSeparator = window["ClientPivotControlMenuSeparator"];
            ClientPivotControlMenuCheckOption = window["ClientPivotControlMenuCheckOption"];
        }
        var SPClientRenderer = {
            GlobalDebugMode: false,
            AddCallStackInfoToErrors: false,
            RenderErrors: true
        };

        SPClientRenderer.IsDebugMode = function(renderCtx) {
            if (typeof renderCtx != "undefined" && null != renderCtx && typeof renderCtx.DebugMode != "undefined") {
                return Boolean(renderCtx.DebugMode);
            }
            else {
                return Boolean(SPClientRenderer.GlobalDebugMode);
            }
        };
        SPClientRenderer.Render = function(node, renderCtx) {
            if (node == null || renderCtx == null)
                return;
            SPClientRenderer._ExecuteRenderCallbacks(renderCtx, 'OnPreRender');
            var result = SPClientRenderer.RenderCore(renderCtx);

            if (renderCtx.Errors != null && renderCtx.Errors.length > 0) {
                var retString = [];

                if (Boolean(SPClientRenderer.RenderErrors)) {
                    for (var i = 0; i < renderCtx.Errors.length; i++) {
                        retString.push(renderCtx.Errors[i]);
                    }
                }
                result = retString.join("") + " ";
            }
            if (result != null && result != '') {
                if (node.tagName == "DIV" || node.tagName == "TD") {
                    if (renderCtx.fHidden)
                        node.style.display = "none";
                    node.innerHTML = result;
                }
                else {
                    var container = document.createElement("div");

                    container.innerHTML = result;
                    var fChild = container.firstChild;

                    if (container.childNodes.length == 1 && fChild != null && fChild.nodeType == 3) {
                        var text = document.createTextNode(result);

                        InsertNodeAfter(node, text);
                    }
                    else {
                        var children = fChild.childNodes;
                        var pNode;

                        pNode = node.parentNode;
                        for (var idx = 0; idx < children.length; idx++) {
                            var childNode = children[idx];

                            if (childNode.nodeType == 1) {
                                if (pNode.nodeName == childNode.nodeName) {
                                    var addNodes = childNode.childNodes;
                                    var nc = addNodes.length;

                                    for (var ix = 0; ix < nc; ix++)
                                        pNode.appendChild(addNodes[0]);
                                }
                                else {
                                    if (renderCtx.fHidden)
                                        childNode.style.display = "none";
                                    pNode.appendChild(children[idx]);
                                    idx--;
                                }
                            }
                        }
                    }
                }
            }
            SPClientRenderer._ExecuteRenderCallbacks(renderCtx, 'OnPostRender');
        };
        SPClientRenderer.RenderReplace = function(node, renderCtx) {
            if (node == null || renderCtx == null)
                return;
            SPClientRenderer._ExecuteRenderCallbacks(renderCtx, 'OnPreRender');
            var result = SPClientRenderer.RenderCore(renderCtx);
            var pNode = node.parentNode;

            if (pNode != null) {
                if (result != null && result != '') {
                    var container = document.createElement("div");

                    container.innerHTML = result;
                    var cNodes = container.childNodes;

                    while (cNodes.length > 0)
                        pNode.insertBefore(cNodes[0], node);
                }
                pNode.removeChild(node);
            }
            SPClientRenderer._ExecuteRenderCallbacks(renderCtx, 'OnPostRender');
        };
        SPClientRenderer._ExecuteRenderCallbacks = function(renderCtx, callbackType) {
            var templateExecContext = {
                Operation: callbackType
            };
            var fn = function() {
                return SPClientRenderer._ExecuteRenderCallbacksWorker(renderCtx, callbackType, templateExecContext);
            };

            return CallFunctionWithErrorHandling(fn, renderCtx, null, templateExecContext);
        };
        SPClientRenderer._ExecuteRenderCallbacksWorker = function(renderCtx, callbackType, templateExecContext) {
            if (!renderCtx || callbackType == null || callbackType == '')
                return;
            var renderCallbacks = renderCtx[callbackType];

            if (renderCallbacks == null)
                return;
            if (typeof renderCallbacks == "function") {
                templateExecContext.TemplateFunction = renderCallbacks;
                renderCallbacks(renderCtx);
            }
            else if (typeof renderCallbacks == "object") {
                var numCallbacks = renderCallbacks.length;

                if (numCallbacks && typeof numCallbacks == "number") {
                    for (var n = 0; n < Number(numCallbacks); n++) {
                        if (typeof renderCallbacks[n] == "function") {
                            templateExecContext.TemplateFunction = renderCallbacks[n];
                            renderCallbacks[n](renderCtx);
                        }
                    }
                }
            }
        };
        SPClientRenderer.RenderCore = function(renderCtx) {
            if (renderCtx == null)
                return '';
            renderCtx.RenderView = RenderView;
            renderCtx.RenderHeader = RenderHeader;
            renderCtx.RenderBody = RenderBody;
            renderCtx.RenderFooter = RenderFooter;
            renderCtx.RenderGroups = RenderGroups;
            renderCtx.RenderItems = RenderItems;
            renderCtx.RenderFields = RenderFields;
            renderCtx.RenderFieldByName = RenderFieldByName;
            return RenderView(renderCtx);
            function RenderView(rCtx) {
                return DoSingleTemplateRender(rCtx, 'View');
            }
            function RenderHeader(rCtx) {
                return DoSingleTemplateRender(rCtx, 'Header');
            }
            function RenderBody(rCtx) {
                return DoSingleTemplateRender(rCtx, 'Body');
            }
            function RenderFooter(rCtx) {
                return DoSingleTemplateRender(rCtx, 'Footer');
            }
            function ResolveTemplate(rCtx, component, level) {
                if (rCtx == null)
                    return '';
                if (rCtx.ResolveTemplate != null && typeof rCtx.ResolveTemplate == "function")
                    return rCtx.ResolveTemplate(rCtx, component, level);
                else
                    return '';
            }
            function DoSingleTemplateRender(inCtx, tplTag) {
                if (inCtx == null)
                    return '';
                var tpl = ResolveTemplate(inCtx, inCtx.ListData, tplTag);

                if (tpl == null || tpl == '') {
                    var templates = inCtx.Templates;

                    if (templates == null)
                        return '';
                    tpl = templates[tplTag];
                }
                if (tpl == null || tpl == '')
                    return '';
                return CoreRender(tpl, inCtx);
            }
            function RenderGroups(inCtx) {
                if (inCtx == null || inCtx.ListData == null)
                    return '';
                var groupTpls = null;

                if (inCtx.Templates != null)
                    groupTpls = inCtx.Templates['Group'];
                var listData = inCtx.ListData;
                var groupData = listData[GetGroupsKey(inCtx)];
                var gStr = '';

                if (groupData == null) {
                    if (typeof groupTpls == "string" || typeof groupTpls == "function") {
                        inCtx['CurrentGroupIdx'] = 0;
                        inCtx['CurrentGroup'] = listData;
                        inCtx['CurrentItems'] = listData[GetItemsKey(inCtx)];
                        gStr += CoreRender(groupTpls, inCtx);
                        inCtx['CurrentItems'] = null;
                        inCtx['CurrentGroup'] = null;
                    }
                    return gStr;
                }
                for (var rg_g = 0; rg_g < groupData.length; rg_g++) {
                    var groupInfo = groupData[rg_g];
                    var tpl = ResolveTemplate(inCtx, groupInfo, 'Group');

                    if (tpl == null || tpl == '') {
                        if (groupTpls == null || groupTpls == {})
                            return '';
                        if (typeof groupTpls == "string" || typeof groupTpls == "function")
                            tpl = groupTpls;
                        if (tpl == null || tpl == '') {
                            var groupType = groupInfo['GroupType'];

                            tpl = groupTpls[groupType];
                        }
                    }
                    if (tpl == null || tpl == '')
                        continue;
                    inCtx['CurrentGroupIdx'] = rg_g;
                    inCtx['CurrentGroup'] = groupInfo;
                    inCtx['CurrentItems'] = groupInfo[GetItemsKey(inCtx)];
                    gStr += CoreRender(tpl, inCtx);
                    inCtx['CurrentGroup'] = null;
                    inCtx['CurrentItems'] = null;
                }
                return gStr;
            }
            function RenderItems(inCtx) {
                if (inCtx == null || inCtx.ListData == null)
                    return '';
                var itemTpls = null;

                if (inCtx.Templates != null)
                    itemTpls = inCtx.Templates['Item'];
                var listData = inCtx.ListData;
                var itemData = inCtx['CurrentItems'];

                if (itemData == null)
                    itemData = typeof inCtx['CurrentGroup'] != "undefined" ? inCtx['CurrentGroup'][GetItemsKey(inCtx)] : null;
                if (itemData == null) {
                    var groups = listData[GetGroupsKey(inCtx)];

                    itemData = typeof groups != "undefined" ? groups[GetItemsKey(inCtx)] : null;
                }
                if (itemData == null)
                    return '';
                var iStr = '';

                for (var i = 0; i < itemData.length; i++) {
                    var itemInfo = itemData[i];
                    var tpl = ResolveTemplate(inCtx, itemInfo, 'Item');

                    if (tpl == null || tpl == '') {
                        if (itemTpls == null || itemTpls == {})
                            return '';
                        if (typeof itemTpls == "string" || typeof itemTpls == "function")
                            tpl = itemTpls;
                        if (tpl == null || tpl == '') {
                            var itemType = itemInfo['ContentType'];

                            tpl = itemTpls[itemType];
                        }
                    }
                    if (tpl == null || tpl == '')
                        continue;
                    inCtx['CurrentItemIdx'] = i;
                    inCtx['CurrentItem'] = itemInfo;
                    if (typeof inCtx['ItemRenderWrapper'] == "string") {
                        inCtx['ItemRenderWrapper'] == SPClientRenderer.ParseTemplateString(inCtx['ItemRenderWrapper'], inCtx);
                    }
                    if (typeof inCtx['ItemRenderWrapper'] == "function") {
                        var renderWrapper = inCtx['ItemRenderWrapper'];
                        var templateExecContext = {
                            TemplateFunction: renderWrapper,
                            Operation: "ItemRenderWrapper"
                        };
                        var renderWrapperFn = function() {
                            return renderWrapper(CoreRender(tpl, inCtx), inCtx, tpl);
                        };

                        iStr += CallFunctionWithErrorHandling(renderWrapperFn, inCtx, '', templateExecContext);
                    }
                    else {
                        iStr += CoreRender(tpl, inCtx);
                    }
                    inCtx['CurrentItem'] = null;
                }
                return iStr;
            }
            function RenderFields(inCtx) {
                if (inCtx == null || inCtx.Templates == null || inCtx.ListSchema == null || inCtx.ListData == null)
                    return '';
                var item = inCtx['CurrentItem'];
                var fields = inCtx.ListSchema['Field'];
                var fieldTpls = inCtx.Templates['Fields'];

                if (item == null || fields == null || fieldTpls == null)
                    return '';
                var fStr = '';

                for (var f in fields)
                    fStr += ExecuteFieldRender(inCtx, fields[f]);
                return fStr;
            }
            function RenderFieldByName(inCtx, fName) {
                if (inCtx == null || inCtx.Templates == null || inCtx.ListSchema == null || inCtx.ListData == null || fName == null || fName == '')
                    return '';
                var item = inCtx['CurrentItem'];
                var fields = inCtx.ListSchema['Field'];
                var fieldTpls = inCtx.Templates['Fields'];

                if (item == null || fields == null || fieldTpls == null)
                    return '';
                if (typeof SPClientTemplates != 'undefined' && spMgr != null && inCtx.ControlMode == SPClientTemplates.ClientControlMode.View)
                    return spMgr.RenderFieldByName(inCtx, fName, item, inCtx.ListSchema);
                for (var f in fields) {
                    if (fields[f].Name == fName)
                        return ExecuteFieldRender(inCtx, fields[f]);
                }
                return '';
            }
            function ExecuteFieldRender(inCtx, fld) {
                var item = inCtx['CurrentItem'];
                var fieldTpls = inCtx.Templates['Fields'];
                var fldName = fld.Name;

                if (typeof item[fldName] == "undefined")
                    return '';
                var tpl = '';

                if (fieldTpls[fldName] != null)
                    tpl = fieldTpls[fldName];
                if (tpl == null || tpl == '')
                    return '';
                inCtx['CurrentFieldValue'] = item[fldName];
                inCtx['CurrentFieldSchema'] = fld;
                var fStr = CoreRender(tpl, inCtx);

                inCtx['CurrentFieldValue'] = null;
                inCtx['CurrentFieldSchema'] = null;
                return fStr;
            }
            function GetGroupsKey(c) {
                var groupsKey = c.ListDataJSONGroupsKey;

                return typeof groupsKey != "string" || groupsKey == '' ? 'Groups' : groupsKey;
            }
            function GetItemsKey(c) {
                var itemsKey = c.ListDataJSONItemsKey;

                return typeof itemsKey != "string" || itemsKey == '' ? 'Items' : itemsKey;
            }
        };
        function CallFunctionWithErrorHandling(fn, c, erv, execCtx) {
            if (SPClientRenderer.IsDebugMode(c)) {
                return fn();
            }
            try {
                return fn();
            }
            catch (e) {
                if (c.Errors == null)
                    c.Errors = [];
                try {
                    e.ExecutionContext = execCtx;
                    if (Boolean(SPClientRenderer.AddCallStackInfoToErrors) && typeof execCtx == "object" && null != execCtx) { }
                }
                catch (ignoreErr) { }
                c.Errors.push(e);
                return erv;
            }
        }
        function CoreRender(t, c) {
            var templateExecContext = {
                TemplateFunction: t,
                Operation: "CoreRender"
            };
            var fn = function() {
                return CoreRenderWorker(t, c);
            };

            return CallFunctionWithErrorHandling(fn, c, '', templateExecContext);
        }
        function CoreRenderWorker(t, c) {
            var tplFunc;

            if (typeof t == "string")
                tplFunc = SPClientRenderer.ParseTemplateString(t, c);
            else if (typeof t == "function")
                tplFunc = t;
            if (tplFunc == null)
                return '';
            return tplFunc(c);
        }
        SPClientRenderer.ParseTemplateString = function(templateStr, c) {
            var templateExecContext = {
                TemplateFunction: templateStr,
                Operation: "ParseTemplateString"
            };
            var fn = function() {
                return SPClientRenderer.ParseTemplateStringWorker(templateStr, c);
            };

            return CallFunctionWithErrorHandling(fn, c, null, templateExecContext);
        };
        SPClientRenderer.ParseTemplateStringWorker = function(templateStr, c) {
            if (templateStr == null || templateStr.length == 0)
                return null;
            var strFunc = "var p=[]; p.push('" + ((((((((((templateStr.replace(/[\r\t\n]/g, " ")).replace(/'(?=[^#]*#>)/g, "\t")).split("'")).join("\\'")).split("\t")).join("'")).replace(/<#=(.+?)#>/g, "',$1,'")).split("<#")).join("');")).split("#>")).join("p.push('") + "'); return p.join('');";
            var func;

            func = new Function("ctx", strFunc);
            return func;
        };
        function GetViewHash(renderCtx) {
            return "";
        }
        SPClientRenderer.ReplaceUrlTokens = function(tokenUrl) {
        };
        function RenderAsyncDataLoad(renderCtx) {
            return '<div style="padding-top:5px;"><center><img src="' + ListView.ImageBasePath + '/_layouts/15/images/gears_an.gif' + '" style="border-width:0px;" /></center></div>';
        }
        function RenderCallbackFailures(renderCtx, req) {
            if (!Boolean(renderCtx) || req == null || req.status != 601)
                return;
            if (renderCtx.Errors == null)
                renderCtx.Errors = [];
            renderCtx.Errors.push(req.responseText);
            SPClientRenderer.Render(document.getElementById('script' + renderCtx.wpq), renderCtx);
        }
        function AsyncDataLoadPostRender(renderCtx) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "NotImplemented -- inplview functionality not yet available in standalone list view" + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function AddPostRenderCallback(renderCtx, newCallback) {
            AddRenderCallback(renderCtx, 'OnPostRender', newCallback, false);
        }
        function AddPostRenderCallbackUnique(renderCtx, newCallback) {
            AddRenderCallback(renderCtx, 'OnPostRender', newCallback, true);
        }
        function AddRenderCallback(renderCtx, callbackType, newCallback, enforceUnique) {
            if (Boolean(renderCtx) && typeof newCallback == 'function' && callbackType != '') {
                var renderCallbacks = renderCtx[callbackType];

                if (renderCallbacks == null)
                    renderCtx[callbackType] = newCallback;
                else if (typeof renderCallbacks == "function") {
                    if (!Boolean(enforceUnique) || String(renderCallbacks) != String(newCallback)) {
                        var array = [];

                        array.push(renderCallbacks);
                        array.push(newCallback);
                        renderCtx[callbackType] = array;
                    }
                }
                else if (typeof renderCallbacks == "object") {
                    var exists = false;

                    if (Boolean(enforceUnique)) {
                        for (var i = 0; i < renderCallbacks.length; i++) {
                            if (renderCallbacks[i] == newCallback) {
                                exists = true;
                                break;
                            }
                        }
                    }
                    if (!exists)
                        renderCtx[callbackType].push(newCallback);
                }
            }
        }
        function InsertNodeAfter(refNode, nodeToInsert) {
            if (refNode == null || refNode.parentNode == null || nodeToInsert == null)
                return;
            var pNode = refNode.parentNode;
            var nextSib = refNode.nextSibling;

            if (nextSib == null)
                pNode.appendChild(nodeToInsert);
            else
                pNode.insertBefore(nodeToInsert, nextSib);
        }
        function GetRelativeDateTimeString(relativeDateTimeJSString) {
            var ret = null;
            var retTemplate = null;
            var codes = relativeDateTimeJSString.split('|');

            if (codes[0] == "0") {
                return relativeDateTimeJSString.substring(2);
            }
            var bFuture = codes[1] == "1";
            var timeBucket = codes[2];
            var timeValue = codes.length >= 4 ? codes[3] : null;
            var timeValue2 = codes.length >= 5 ? codes[4] : null;

            switch (timeBucket) {
            case "1":
                ret = bFuture ? GetString("L_RelativeDateTime_AFewSecondsFuture") : GetString("L_RelativeDateTime_AFewSeconds");
                break;
            case "2":
                ret = bFuture ? GetString("L_RelativeDateTime_AboutAMinuteFuture") : GetString("L_RelativeDateTime_AboutAMinute");
                break;
            case "3":
                retTemplate = GetLocalizedCountValue(bFuture ? GetString("L_RelativeDateTime_XMinutesFuture") : GetString("L_RelativeDateTime_XMinutes"), bFuture ? GetString("L_RelativeDateTime_XMinutesFutureIntervals") : GetString("L_RelativeDateTime_XMinutesIntervals"), Number(timeValue));
                break;
            case "4":
                ret = bFuture ? GetString("L_RelativeDateTime_AboutAnHourFuture") : GetString("L_RelativeDateTime_AboutAnHour");
                break;
            case "5":
                if (timeValue == null) {
                    ret = bFuture ? GetString("L_RelativeDateTime_Tomorrow") : GetString("L_RelativeDateTime_Yesterday");
                }
                else {
                    retTemplate = bFuture ? GetString("L_RelativeDateTime_TomorrowAndTime") : GetString("L_RelativeDateTime_YesterdayAndTime");
                }
                break;
            case "6":
                retTemplate = GetLocalizedCountValue(bFuture ? GetString("L_RelativeDateTime_XHoursFuture") : GetString("L_RelativeDateTime_XHours"), bFuture ? GetString("L_RelativeDateTime_XHoursFutureIntervals") : GetString("L_RelativeDateTime_XHoursIntervals"), Number(timeValue));
                break;
            case "7":
                if (timeValue2 == null) {
                    ret = timeValue;
                }
                else {
                    retTemplate = GetString("L_RelativeDateTime_DayAndTime");
                }
                break;
            case "8":
                retTemplate = GetLocalizedCountValue(bFuture ? GetString("L_RelativeDateTime_XDaysFuture") : GetString("L_RelativeDateTime_XDays"), bFuture ? GetString("L_RelativeDateTime_XDaysFutureIntervals") : GetString("L_RelativeDateTime_XDaysIntervals"), Number(timeValue));
                break;
            case "9":
                ret = GetString("L_RelativeDateTime_Today");
                break;
            }
            if (retTemplate != null) {
                ret = retTemplate.replace("{0}", timeValue);
                if (timeValue2 != null) {
                    ret = ret.replace("{1}", timeValue2);
                }
            }
            return ret;
        }
        function GetLocalizedCountValue(locText, intervals, count) {
            if (locText == undefined || intervals == undefined || count == undefined) {
                return null;
            }
            var ret = '';
            var locIndex = -1;
            var intervalsArray = [];

            Array.addRange(intervalsArray, intervals.split('||'));
            for (var i = 0, lenght = intervalsArray.length; i < lenght; i++) {
                var interval = intervalsArray[i];

                if (interval == null || interval == "") {
                    continue;
                }
                var subIntervalsArray = [];

                Array.addRange(subIntervalsArray, interval.split(','));
                for (var k = 0, subLength = subIntervalsArray.length; k < subLength; k++) {
                    var subInterval = subIntervalsArray[k];

                    if (subInterval == null || subInterval == "") {
                        continue;
                    }
                    if (isNaN(Number.parseInvariant(subInterval))) {
                        var range = subInterval.split('-');

                        if (range == null || range.length !== 2) {
                            continue;
                        }
                        var min;
                        var max;

                        if (range[0] === '') {
                            min = 0;
                        }
                        else {
                            if (isNaN(Number.parseInvariant(range[0]))) {
                                continue;
                            }
                            else {
                                min = parseInt(range[0]);
                            }
                        }
                        if (count >= min) {
                            if (range[1] === '') {
                                locIndex = i;
                                break;
                            }
                            else {
                                if (isNaN(Number.parseInvariant(range[1]))) {
                                    continue;
                                }
                                else {
                                    max = parseInt(range[1]);
                                }
                            }
                            if (count <= max) {
                                locIndex = i;
                                break;
                            }
                        }
                    }
                    else {
                        var exactNumber = parseInt(subInterval);

                        if (count === exactNumber) {
                            locIndex = i;
                            break;
                        }
                    }
                }
                if (locIndex !== -1) {
                    break;
                }
            }
            if (locIndex !== -1) {
                var locValues = locText.split('||');

                if (locValues != null && locValues[locIndex] != null && locValues[locIndex] != "") {
                    ret = locValues[locIndex];
                }
            }
            return ret;
        }
        function GetDaysAfterToday(targetDate) {
            throw "Regional settings not (yet) supported in standalone list view.";
        }
        var g_QCB_nextId = 1;

        function QCB(definition) {
            (function() {
                if (!(IE8Support != null)) {
                    if (confirm("Assertion failed: " + ("IE8Support" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            (function() {
                if (!(CSSUtil != null)) {
                    if (confirm("Assertion failed: " + ("CSSUtil" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            (function() {
                if (!(DOM != null)) {
                    if (confirm("Assertion failed: " + ("DOM" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            (function() {
                if (!(Renderer != null)) {
                    if (confirm("Assertion failed: " + ("Renderer" + " is required by this module.") + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            var rootElem = null;
            var rootId = "QCB" + String(g_QCB_nextId++);
            var renderer = new Renderer();

            renderer.SetTemplate("root", "{%version 2.0}\u003cdiv class=\"ms-qcb-root\" id=\"{=id}\"\u003e\u003cul class=\"ms-qcb-zone ms-qcb-leftzone\"\u003e\n                {%foreach item left}\n            \u003c/ul\u003e\u003cul class=\"ms-qcb-zone ms-qcb-rightzone\"\u003e\n                {%foreach item right}\n            \u003c/ul\u003e\u003chr class=\"ms-qcb-clearSeparator\" /\u003e\u003c/div\u003e");
            renderer.SetTemplate("item", "{%version 2.0}\u003cli class=\"ms-qcb-item\"\u003e\u003cbutton class=\"ms-qcb-button {=buttonClass}\" onclick=\"{+itemClick .}\" disabled=\"disabled\" type=\"button\" title=\"{=disabledTooltip}\" id=\"{=id}\"\u003e\u003cspan class=\"ms-qcb-glyph {=glyphClass}\"\u003e{=glyph}\u003c/span\u003e{=title}\n            \u003c/button\u003e\u003c/li\u003e");
            this.Poll = function() {
                rootElem = document.getElementById(rootId);
                if (!Boolean(rootElem)) {
                    if (typeof definition.onDestroyed == "function") {
                        definition.onDestroyed();
                    }
                    return;
                }
                var thisQCB = this;

                forEachButton(definition, function(button) {
                    var pollResponseShouldDisable = !button.shouldEnable({
                        "id": button.id
                    });

                    if (button.disabled !== pollResponseShouldDisable) {
                        button.disabled = !button.disabled;
                        var elem = document.getElementById(button.id);

                        if (!Boolean(elem)) {
                            thisQCB._logError("QCB_ButtonElementNotFoundDuringPolling", "Could not find button with ID: '" + button.id + "' to set disabled state on. Button title: '" + button.title);
                            return;
                        }
                        if (button.disabled) {
                            elem.setAttribute("disabled", "disabled");
                            elem.setAttribute("title", button.disabledTooltip);
                            if (Boolean(definition.disabledClass))
                                CSSUtil.AddClass(elem, definition.disabledClass);
                        }
                        else {
                            elem.removeAttribute("disabled");
                            elem.setAttribute("title", button.tooltip);
                            if (Boolean(definition.disabledClass))
                                CSSUtil.RemoveClass(elem, definition.disabledClass);
                        }
                    }
                });
            };
            this.Render = function(containerElement) {
                if (rootElem !== null) {
                    rootElem.parentNode.removeChild(rootElem);
                    rootElem = null;
                }
                containerElement.innerHTML = renderer.Render("root", definition);
                rootElem = containerElement.firstChild;
                var thisQCB = this;

                forEachButton(definition, function(button) {
                    if (Boolean(button.accessKey)) {
                        var elem = document.getElementById(button.id);

                        if (!Boolean(elem)) {
                            thisQCB._logError("QCB_ButtonNotFoundDuringRender", "Could not find button with ID: '" + button.id + "' to apply an access key to. Button title: '" + button.title);
                            return;
                        }
                        elem.setAttribute("accesskey", button.accessKey);
                    }
                });
                this.Poll();
            };
            this._logError = function(tag, message) {
                if (Boolean(definition.onError)) {
                    definition.onError(tag, message);
                }
            };
            function forEachButton(def, fn) {
                var zone = def.left;
                var finished = false;

                while (true) {
                    for (var i = 0; i < zone.length; i++) {
                        var button = zone[i];

                        fn(button);
                    }
                    if (finished)
                        break;
                    zone = def.right;
                    finished = true;
                }
            }
            renderer.RegisterHandler("itemClick", function(evt, button) {
                button.onClick.call(this, evt);
            });
            prepareDefinitionForRender(definition);
            function prepareDefinitionForRender(def) {
                def.id = rootId;
                if (!Boolean(def.left))
                    def.left = [];
                if (!Boolean(def.right))
                    def.right = [];
                var nextId = 1;

                forEachButton(def, function(button) {
                    button.disabled = true;
                    button.id = rootId + "_Button" + String(nextId++);
                    if (!Boolean(button.buttonClass))
                        button.buttonClass = "";
                    if (Boolean(def.buttonClass)) {
                        if (button.buttonClass != "")
                            button.buttonClass += " ";
                        button.buttonClass += def.buttonClass;
                    }
                    if (!Boolean(button.disabledTooltip))
                        button.disabledTooltip = button.tooltip;
                });
            }
        }
        function IsTouchSupported() {
            return window.navigator.msMaxTouchPoints != null && window.navigator.msMaxTouchPoints > 0 || document.documentElement != null && 'ontouchstart' in document.documentElement;
        }
        function RenderListView(renderCtx, wpq, templateBody, bAnimation, bRenderHiddenFooter) {
            if (Boolean(renderCtx)) {
                standaloneCtx = renderCtx;
                standaloneCtx.clvp = FindClvp();
                renderCtx.ListDataJSONItemsKey = 'Row';
                renderCtx.ControlMode = SPClientTemplates.ClientControlMode.View;
                SPClientTemplates.Utility.GetPropertiesFromPageContextInfo(renderCtx);
                if (!Boolean(renderCtx.bIncremental))
                    renderCtx.Templates = SPClientTemplates.TemplateManager.GetTemplates(renderCtx);
                if (renderCtx.Templates.Body == RenderGroupTemplateDefault)
                    renderCtx.Templates.Body = RenderBodyTemplate;
                if (renderCtx.Templates.Header == '')
                    renderCtx.Templates.Header = RenderHeaderTemplate;
                var oldFooterTemplate = renderCtx.Templates.Footer;
                var oldBodyTemplate = renderCtx.Templates.Body;
                var oldHeaderTemplate = renderCtx.Templates.Header;
                var oldViewTemplate = renderCtx.Templates.View;
                var postRenderFunc = function() {
                };

                AddPostRenderCallbackUnique(renderCtx, postRenderFunc);
                var postRender = renderCtx.OnPostRender;
                var preRender = renderCtx.OnPreRender;

                renderCtx.OnPostRender = null;
                if (Boolean(renderCtx.ListSchema) && renderCtx.ListSchema.IsDocLib) {
                    EnableSharingDialogIfNeeded(renderCtx);
                }
                renderCtx.Templates.Footer = '';
                if (Boolean(renderCtx.bInitialRender) && Boolean(renderCtx.AsyncDataLoad)) {
                    renderCtx.OnPreRender = null;
                    renderCtx.Templates.View = RenderAsyncDataLoad;
                    renderCtx.Templates.Header = '';
                    renderCtx.Templates.Body = '';
                    renderCtx.Templates.Footer = '';
                    renderCtx.OnPostRender = null;
                    renderCtx.OnPostRender = AsyncDataLoadPostRender;
                }
                if (templateBody != null) {
                    renderCtx.Templates.Header = '';
                    if (bAnimation) {
                        var firstTbody = templateBody.nextSibling;

                        while (firstTbody != null && firstTbody.nextSibling != null)
                            templateBody.parentNode.removeChild(firstTbody.nextSibling);
                        var oldHiddenValue = renderCtx.fHidden;

                        renderCtx.fHidden = true;
                        SPClientRenderer.Render(templateBody, renderCtx);
                        renderCtx.fHidden = oldHiddenValue;
                    }
                    else {
                        while (templateBody.nextSibling != null)
                            templateBody.parentNode.removeChild(templateBody.nextSibling);
                        var childNode = templateBody.lastChild;

                        while (childNode != null) {
                            templateBody.removeChild(childNode);
                            childNode = templateBody.lastChild;
                        }
                        SPClientRenderer.Render(templateBody, renderCtx);
                    }
                }
                else {
                    SPClientRenderer.Render(document.getElementById('script' + wpq), renderCtx);
                }
                if (!Boolean(renderCtx.bInitialRender) || !Boolean(renderCtx.AsyncDataLoad)) {
                    renderCtx.Templates.Body = '';
                    renderCtx.Templates.Header = '';
                    if (oldFooterTemplate == '')
                        renderCtx.Templates.Footer = RenderFooterTemplate;
                    else
                        renderCtx.Templates.Footer = oldFooterTemplate;
                    renderCtx.OnPreRender = null;
                    renderCtx.OnPostRender = postRender;
                    var oldCtxHidden = renderCtx.fHidden;

                    renderCtx.fHidden = Boolean(bRenderHiddenFooter);
                    SPClientRenderer.Render(document.getElementById('scriptPaging' + wpq), renderCtx);
                    renderCtx.fHidden = oldCtxHidden;
                }
                renderCtx.Templates.View = oldViewTemplate;
                renderCtx.Templates.Body = oldBodyTemplate;
                renderCtx.Templates.Header = oldHeaderTemplate;
                renderCtx.Templates.Footer = oldFooterTemplate;
                renderCtx.OnPreRender = preRender;
                renderCtx.OnPostRender = postRender;
            }
        }
        var SPClientTemplates = {};

        SPClientTemplates.FileSystemObjectType = {
            Invalid: -1,
            File: 0,
            Folder: 1,
            Web: 2
        };
        SPClientTemplates.ChoiceFormatType = {
            Dropdown: 0,
            Radio: 1
        };
        SPClientTemplates.ClientControlMode = {
            Invalid: 0,
            DisplayForm: 1,
            EditForm: 2,
            NewForm: 3,
            View: 4
        };
        SPClientTemplates.RichTextMode = {
            Compatible: 0,
            FullHtml: 1,
            HtmlAsXml: 2,
            ThemeHtml: 3
        };
        SPClientTemplates.UrlFormatType = {
            Hyperlink: 0,
            Image: 1
        };
        SPClientTemplates.DateTimeDisplayFormat = {
            DateOnly: 0,
            DateTime: 1,
            TimeOnly: 2
        };
        SPClientTemplates.DateTimeCalendarType = {
            None: 0,
            Gregorian: 1,
            Japan: 3,
            Taiwan: 4,
            Korea: 5,
            Hijri: 6,
            Thai: 7,
            Hebrew: 8,
            GregorianMEFrench: 9,
            GregorianArabic: 10,
            GregorianXLITEnglish: 11,
            GregorianXLITFrench: 12,
            KoreaJapanLunar: 14,
            ChineseLunar: 15,
            SakaEra: 16,
            UmAlQura: 23
        };
        SPClientTemplates.UserSelectionMode = {
            PeopleOnly: 0,
            PeopleAndGroups: 1
        };
        SPClientTemplates.PresenceIndicatorSize = {
            Bar_5px: "5",
            Bar_8px: "8",
            Square_10px: "10",
            Square_12px: "12"
        };
        SPClientTemplates.TemplateManager = {};
        SPClientTemplates.TemplateManager._TemplateOverrides = {};
        SPClientTemplates.TemplateManager._TemplateOverrides.View = {};
        SPClientTemplates.TemplateManager._TemplateOverrides.Header = {};
        SPClientTemplates.TemplateManager._TemplateOverrides.Body = {};
        SPClientTemplates.TemplateManager._TemplateOverrides.Footer = {};
        SPClientTemplates.TemplateManager._TemplateOverrides.Group = {};
        SPClientTemplates.TemplateManager._TemplateOverrides.Item = {};
        SPClientTemplates.TemplateManager._TemplateOverrides.Fields = {};
        SPClientTemplates.TemplateManager._TemplateOverrides.OnPreRender = {};
        SPClientTemplates.TemplateManager._TemplateOverrides.OnPostRender = {};
        SPClientTemplates.TemplateManager._RegisterDefaultTemplates = function(renderCtx) {
            if (!renderCtx || !renderCtx.Templates && !renderCtx.OnPreRender && !renderCtx.OnPostRender)
                return;
            var tempStruct = SPClientTemplates._defaultTemplates;

            SPClientTemplates.TemplateManager._RegisterTemplatesInternal(renderCtx, tempStruct);
        };
        SPClientTemplates.TemplateManager.RegisterTemplateOverrides = function(renderCtx) {
            if (!renderCtx || !renderCtx.Templates && !renderCtx.OnPreRender && !renderCtx.OnPostRender)
                return;
            var tempStruct = SPClientTemplates.TemplateManager._TemplateOverrides;

            SPClientTemplates.TemplateManager._RegisterTemplatesInternal(renderCtx, tempStruct);
        };
        SPClientTemplates.TemplateManager._RegisterTemplatesInternal = function(renderCtx, registeredOverrides) {
            if (!renderCtx || !registeredOverrides || !renderCtx.Templates && !renderCtx.OnPreRender && !renderCtx.OnPostRender)
                return;
            var tmps = renderCtx.Templates != null ? renderCtx.Templates : {};
            var typeInfo = SPClientTemplates.Utility.ComputeRegisterTypeInfo(renderCtx);

            if (typeof renderCtx.OnPreRender != "undefined")
                tmps['OnPreRender'] = renderCtx.OnPreRender;
            if (typeof renderCtx.OnPostRender != "undefined")
                tmps['OnPostRender'] = renderCtx.OnPostRender;
            for (var tmplName in tmps) {
                switch (tmplName) {
                case 'Group':
                case 'Item':
                    if (typeof tmps[tmplName] == "function" || typeof tmps[tmplName] == "string")
                        tmps[tmplName] = {
                            "__DefaultTemplate__": tmps[tmplName]
                        };
                case 'View':
                case 'Header':
                case 'Body':
                case 'Footer':
                case 'Fields':
                case 'OnPreRender':
                case 'OnPostRender':
                    var bCallbackTag = tmplName == 'OnPreRender' || tmplName == 'OnPostRender';
                    var bSingleTpl = tmplName == 'View' || tmplName == 'Header' || tmplName == 'Body' || tmplName == 'Footer';
                    var bSetTpl = tmplName == 'Item' || tmplName == 'Group' || tmplName == 'Fields';
                    var viewStyleTpls, listTpls;
                    var tpls = registeredOverrides[tmplName];

                    if (typeInfo.defaultViewStyle) {
                        if (!tpls['default'])
                            tpls['default'] = {};
                        viewStyleTpls = tpls['default'];
                        HandleListTemplates();
                    }
                    else {
                        for (var vsIdx = 0; vsIdx < typeInfo.viewStyle.length; vsIdx++) {
                            var viewStyleKey = typeInfo.viewStyle[vsIdx];

                            if (!tpls[viewStyleKey])
                                tpls[viewStyleKey] = {};
                            viewStyleTpls = tpls[viewStyleKey];
                            HandleListTemplates();
                        }
                    }
                }
            }
            function HandleListTemplates() {
                if (typeInfo.allLists) {
                    if (!viewStyleTpls['all'])
                        viewStyleTpls['all'] = {};
                    listTpls = viewStyleTpls['all'];
                    if (bSingleTpl || bSetTpl)
                        HandleTemplateRegistration();
                    else
                        HandleCallbackRegistration();
                }
                else {
                    for (var ltIdx = 0; ltIdx < typeInfo.ltype.length; ltIdx++) {
                        var ltypeKey = typeInfo.ltype[ltIdx];

                        if (!viewStyleTpls[ltypeKey])
                            viewStyleTpls[ltypeKey] = {};
                        listTpls = viewStyleTpls[ltypeKey];
                    }
                    if (bSingleTpl || bSetTpl)
                        HandleTemplateRegistration();
                    else
                        HandleCallbackRegistration();
                }
            }
            function HandleTemplateRegistration() {
                var viewSet = typeInfo.allViews ? listTpls['all'] : listTpls[typeInfo.viewId];
                var newTpls = tmps[tmplName];

                if (bSingleTpl) {
                    if (typeof newTpls == "function" || typeof newTpls == "string")
                        viewSet = newTpls;
                }
                else {
                    if (!viewSet)
                        viewSet = {};
                    for (var t in newTpls)
                        viewSet[t] = newTpls[t];
                }
                if (typeInfo.allViews)
                    listTpls['all'] = viewSet;
                else
                    listTpls[typeInfo.viewId] = viewSet;
            }
            function HandleCallbackRegistration() {
                var newCallbacks = tmps[tmplName];

                if (!newCallbacks)
                    return;
                var viewCallbacks = typeInfo.allViews ? listTpls['all'] : listTpls[typeInfo.viewId];

                if (!viewCallbacks)
                    viewCallbacks = [];
                if (typeof newCallbacks == "function")
                    viewCallbacks.push(newCallbacks);
                else {
                    var newLen = newCallbacks.length;

                    if (typeof newLen == "number") {
                        for (var n = 0; n < Number(newLen); n++) {
                            if (typeof newCallbacks[n] == "function")
                                viewCallbacks.push(newCallbacks[n]);
                        }
                    }
                }
                if (typeInfo.allViews)
                    listTpls['all'] = viewCallbacks;
                else
                    listTpls[typeInfo.viewId] = viewCallbacks;
            }
        };
        SPClientTemplates.TemplateManager.GetTemplates = function(renderCtx) {
            if (!renderCtx)
                renderCtx = {};
            if (!renderCtx.Templates)
                renderCtx.Templates = {};
            var registeredOverrides = SPClientTemplates.TemplateManager._TemplateOverrides;
            var typeInfo = SPClientTemplates.Utility.ComputeResolveTypeInfo(renderCtx);

            ResolveRenderCallbacks();
            var tmp = {};

            tmp.View = ResolveSingleTemplate('View');
            tmp.Header = ResolveSingleTemplate('Header');
            tmp.Body = ResolveSingleTemplate('Body');
            tmp.Footer = ResolveSingleTemplate('Footer');
            tmp.Group = ResolveGroupTemplates();
            tmp.Item = ResolveItemTemplates();
            tmp.Fields = ResolveFieldTemplates();
            return tmp;
            function ResolveSingleTemplate(tag) {
                var tplOverrides = registeredOverrides[tag];
                var tplDefaults = SPClientTemplates._defaultTemplates[tag];
                var result = null;

                if (!typeInfo.defaultViewStyle) {
                    result = ResolveSingleTemplateByViewStyle(tplOverrides[typeInfo.viewStyle], tag);
                    if (result == null)
                        result = ResolveSingleTemplateByViewStyle(tplDefaults[typeInfo.viewStyle], tag);
                }
                if (result == null)
                    result = ResolveSingleTemplateByViewStyle(tplOverrides['default'], tag);
                if (result == null)
                    result = ResolveSingleTemplateByViewStyle(tplDefaults['default'], tag);
                if (result == null)
                    result = GetSimpleSPTemplateByTag(tag);
                return result;
            }
            function ResolveSingleTemplateByViewStyle(vsOverride, tag) {
                if (typeof vsOverride == "undefined")
                    return null;
                var result = CheckView(vsOverride[typeInfo.ltype], typeInfo.viewId);

                if (result == null)
                    result = CheckView(vsOverride['all'], typeInfo.viewId);
                return result;
            }
            function ResolveGroupTemplates() {
                var resultSet = {};
                var tTag = 'Group';
                var keyIdx = tTag + 'Keys';
                var templateKeys = renderCtx[keyIdx];

                if (templateKeys == null || templateKeys.length == 0)
                    templateKeys = ["__DefaultTemplate__"];
                for (var i in templateKeys) {
                    var iKey = templateKeys[i];

                    if (!resultSet[iKey]) {
                        var result = ResolveTemplateByKey(tTag, iKey);

                        if (iKey == "__DefaultTemplate__")
                            return result;
                        resultSet[iKey] = result;
                    }
                }
                return resultSet;
            }
            function ResolveItemTemplates() {
                var resultSet = {};
                var itemKey = GetItemsKey(renderCtx);

                if (renderCtx.ListData == null || renderCtx.ListData[itemKey] == null)
                    return ResolveTemplateByKey("Item", "__DefaultTemplate__");
                var knownContentTypes = {};
                var knownContentTypeCount = 0;
                var allItems = renderCtx.ListData[itemKey];
                var numItems = allItems.length;

                for (var i = 0; i < numItems; i++) {
                    var item = allItems[i];

                    if (item != null) {
                        var contentType = item['ContentType'];

                        if (contentType != null && typeof knownContentTypes[contentType] == 'undefined') {
                            knownContentTypeCount++;
                            knownContentTypes[contentType] = true;
                        }
                    }
                }
                if (knownContentTypeCount == 0)
                    return ResolveTemplateByKey("Item", "__DefaultTemplate__");
                var knownItemTemplatesDict = {};
                var knownItemTemplatesArray = [];

                for (var cType in knownContentTypes) {
                    var currentTemplate = ResolveTemplateByKey('Item', cType);

                    resultSet[cType] = currentTemplate;
                    if (typeof knownItemTemplatesDict[currentTemplate] == 'undefined') {
                        knownItemTemplatesArray.push(currentTemplate);
                        knownItemTemplatesDict[currentTemplate] = true;
                    }
                }
                if (knownItemTemplatesArray.length == 1)
                    return knownItemTemplatesArray[0];
                return resultSet;
            }
            function ResolveFieldTemplates() {
                var resultSet = {};
                var registeredFieldTypes = {};
                var knownFieldModes = renderCtx.FieldControlModes != null ? renderCtx.FieldControlModes : {};
                var defaultFieldMode = typeof renderCtx.ControlMode != "undefined" ? renderCtx.ControlMode : SPClientTemplates.ClientControlMode.View;

                if (renderCtx.ListSchema == null || renderCtx.ListSchema.Field == null)
                    return resultSet;
                var allFields = renderCtx.ListSchema.Field;
                var numFields = allFields.length;

                for (var f = 0; f < numFields; f++) {
                    var fld = allFields[f];

                    if (fld != null) {
                        var fldName = fld['Name'];
                        var fldType = fld['FieldType'];
                        var fldKnownParentType = fld['Type'];
                        var fldMode = knownFieldModes[fldName] != null ? knownFieldModes[fldName] : defaultFieldMode;
                        var fldModeStr = SPClientTemplates.Utility.ControlModeToString(fldMode);
                        var regOverride = GetRegisteredOverride('Fields', fldName, fldModeStr);

                        if (regOverride != null) {
                            resultSet[fldName] = regOverride;
                        }
                        else {
                            if (typeof registeredFieldTypes[fldType] != "undefined" && typeof registeredFieldTypes[fldType][fldModeStr] != "undefined") {
                                resultSet[fldName] = registeredFieldTypes[fldType][fldModeStr];
                            }
                            else {
                                var fldTmpl = GetRegisteredOverrideOrDefault('Fields', fldType, fldModeStr);

                                if (fldTmpl == null)
                                    fldTmpl = ResolveTemplateByKey('Fields', fldKnownParentType, fldModeStr);
                                resultSet[fldName] = fldTmpl;
                                if (!registeredFieldTypes[fldType])
                                    registeredFieldTypes[fldType] = {};
                                registeredFieldTypes[fldType][fldModeStr] = fldTmpl;
                            }
                        }
                    }
                }
                return resultSet;
            }
            function ResolveTemplateByKey(tagName, tempKey, fieldMode) {
                var result = GetRegisteredOverrideOrDefault(tagName, tempKey, fieldMode);

                if (result == null)
                    result = GetSimpleSPTemplateByTag(tagName, fieldMode);
                return result;
            }
            function ResolveTemplateKeyByViewStyle(vsOverride, tempKey, fieldMode) {
                if (typeof vsOverride == "undefined")
                    return null;
                var result = CheckType(vsOverride[typeInfo.ltype], typeInfo.viewId, tempKey, fieldMode);

                if (result == null)
                    result = CheckType(vsOverride['all'], typeInfo.viewId, tempKey, fieldMode);
                return result;
            }
            function GetRegisteredOverride(tagName, tempKey, fieldMode) {
                var tplOverrides = registeredOverrides[tagName];
                var result = null;

                if (!typeInfo.defaultViewStyle)
                    result = ResolveTemplateKeyByViewStyle(tplOverrides[typeInfo.viewStyle], tempKey, fieldMode);
                if (result == null)
                    result = ResolveTemplateKeyByViewStyle(tplOverrides['default'], tempKey, fieldMode);
                return result;
            }
            function GetRegisteredOverrideOrDefault(tagName, tempKey, fieldMode) {
                var tplOverrides = registeredOverrides[tagName];
                var tplDefaults = SPClientTemplates._defaultTemplates[tagName];
                var result = null;

                if (!typeInfo.defaultViewStyle) {
                    result = ResolveTemplateKeyByViewStyle(tplOverrides[typeInfo.viewStyle], tempKey, fieldMode);
                    if (result == null)
                        result = ResolveTemplateKeyByViewStyle(tplDefaults[typeInfo.viewStyle], tempKey, fieldMode);
                }
                if (result == null)
                    result = ResolveTemplateKeyByViewStyle(tplOverrides['default'], tempKey, fieldMode);
                if (result == null)
                    result = ResolveTemplateKeyByViewStyle(tplDefaults['default'], tempKey, fieldMode);
                return result;
            }
            function CheckType(viewOverrides, viewId, key, fMode) {
                var result = null;
                var overrides = CheckView(viewOverrides, viewId);

                if (overrides != null) {
                    if (typeof overrides[key] != "undefined")
                        result = overrides[key];
                    if (result == null && typeof overrides["__DefaultTemplate__"] != "undefined")
                        result = overrides["__DefaultTemplate__"];
                }
                if (result != null && typeof fMode != "undefined")
                    result = result[fMode];
                return result;
            }
            function CheckView(listOverrides, viewId) {
                if (typeof listOverrides != "undefined") {
                    if (typeof listOverrides[viewId] != "undefined")
                        return listOverrides[viewId];
                    if (typeof listOverrides['all'] != "undefined")
                        return listOverrides['all'];
                }
                return null;
            }
            function GetSimpleSPTemplateByTag(tplTag, fMode) {
                var result = null;

                switch (tplTag) {
                case 'View':
                    result = RenderViewTemplate;
                    break;
                case 'Header':
                    result = '';
                    break;
                case 'Body':
                    result = RenderGroupTemplateDefault;
                    break;
                case 'Footer':
                    result = '';
                    break;
                case 'Group':
                    result = RenderItemTemplateDefault;
                    break;
                case 'Item':
                    result = RenderFieldTemplateDefault;
                    break;
                case 'Fields':
                    result = RenderFieldValueDefault;
                }
                return result;
            }
            function ResolveRenderCallbacks() {
                var preRender = [], postRender = [];
                var regPreRender = registeredOverrides['OnPreRender'];
                var regPostRender = registeredOverrides['OnPostRender'];

                if (!typeInfo.defaultViewStyle) {
                    CheckViewStyleCallbacks(preRender, regPreRender[typeInfo.viewStyle]);
                    CheckViewStyleCallbacks(postRender, regPostRender[typeInfo.viewStyle]);
                }
                CheckViewStyleCallbacks(preRender, regPreRender['default']);
                CheckViewStyleCallbacks(postRender, regPostRender['default']);
                renderCtx.OnPreRender = preRender;
                renderCtx.OnPostRender = postRender;
            }
            function CheckViewStyleCallbacks(set, viewStyleCallbacks) {
                if (typeof viewStyleCallbacks != "undefined") {
                    CheckListCallbacks(set, viewStyleCallbacks['all'], typeInfo.viewId);
                    CheckListCallbacks(set, viewStyleCallbacks[typeInfo.ltype], typeInfo.viewId);
                }
            }
            function CheckListCallbacks(resSet, listCallbacks, viewId) {
                if (typeof listCallbacks != "undefined") {
                    if (typeof listCallbacks['all'] != "undefined")
                        GetViewCallbacks(resSet, listCallbacks['all']);
                    if (typeof listCallbacks[viewId] != "undefined")
                        GetViewCallbacks(resSet, listCallbacks[viewId]);
                }
            }
            function GetViewCallbacks(rSet, viewCallbacks) {
                if (typeof viewCallbacks != "undefined") {
                    if (typeof viewCallbacks == "function")
                        rSet.push(viewCallbacks);
                    else {
                        var newLen = viewCallbacks.length;

                        if (typeof newLen == "number") {
                            for (var n = 0; n < Number(newLen); n++) {
                                if (typeof viewCallbacks[n] == "function")
                                    rSet.push(viewCallbacks[n]);
                            }
                        }
                    }
                }
            }
            function GetItemsKey(c) {
                var itemsKey = c.ListDataJSONItemsKey;

                return typeof itemsKey != "string" || itemsKey == '' ? 'Items' : itemsKey;
            }
        };
        SPClientTemplates.Utility = {};
        SPClientTemplates.Utility.ComputeResolveTypeInfo = function(rCtx) {
            return new SPTemplateManagerResolveTypeInfo(rCtx);
        };
        function SPTemplateManagerResolveTypeInfo(rCtx) {
            if (rCtx != null) {
                this.defaultViewStyle = typeof rCtx.ViewStyle == "undefined";
                this.viewStyle = this.defaultViewStyle ? 'null' : rCtx.ViewStyle.toString();
                this.allLists = typeof rCtx.ListTemplateType == "undefined";
                this.ltype = this.allLists ? 'null' : rCtx.ListTemplateType.toString();
                this.allViews = typeof rCtx.BaseViewID == "undefined";
                this.viewId = this.allViews ? 'null' : rCtx.BaseViewID.toString();
            }
        }
        function SPTemplateManagerResolveTypeInfo_InitializePrototype() {
            SPTemplateManagerResolveTypeInfo.prototype = {
                defaultViewStyle: true,
                viewStyle: "",
                allLists: true,
                ltype: "",
                allViews: true,
                viewId: ""
            };
        }
        SPTemplateManagerResolveTypeInfo_InitializePrototype();
        SPClientTemplates.Utility.ComputeRegisterTypeInfo = function(rCtx) {
            return new SPTemplateManagerRegisterTypeInfo(rCtx);
        };
        function SPTemplateManagerRegisterTypeInfo(rCtx) {
            if (rCtx != null) {
                this.defaultViewStyle = typeof rCtx.ViewStyle == "undefined";
                this.allLists = typeof rCtx.ListTemplateType == "undefined";
                this.allViews = typeof rCtx.BaseViewID == "undefined";
                if (!this.allLists) {
                    if (typeof rCtx.ListTemplateType == "string" || typeof rCtx.ListTemplateType == "number")
                        this.ltype = [rCtx.ListTemplateType.toString()];
                    else
                        this.ltype = rCtx.ListTemplateType;
                }
                if (!this.allViews) {
                    if (typeof rCtx.BaseViewID == "string" || typeof rCtx.BaseViewID == "number")
                        this.viewId = [rCtx.BaseViewID.toString()];
                    else
                        this.viewId = rCtx.BaseViewID;
                }
                if (!this.defaultViewStyle) {
                    if (typeof rCtx.ViewStyle == "string" || typeof rCtx.ViewStyle == "number")
                        this.viewStyle = [rCtx.ViewStyle.toString()];
                    else
                        this.viewStyle = rCtx.ViewStyle;
                }
            }
        }
        function SPTemplateManagerRegisterTypeInfo_InitializePrototype() {
            SPTemplateManagerRegisterTypeInfo.prototype = {
                defaultViewStyle: true,
                viewStyle: [],
                allLists: true,
                ltype: [],
                allViews: true,
                viewId: []
            };
        }
        SPTemplateManagerRegisterTypeInfo_InitializePrototype();
        SPClientTemplates.Utility.ControlModeToString = function(mode) {
            var modeObj = SPClientTemplates.ClientControlMode;

            if (mode == modeObj.DisplayForm)
                return 'DisplayForm';
            if (mode == modeObj.EditForm)
                return 'EditForm';
            if (mode == modeObj.NewForm)
                return 'NewForm';
            if (mode == modeObj.View)
                return 'View';
            return 'Invalid';
        };
        SPClientTemplates.Utility.FileSystemObjectTypeToString = function(type) {
            var typeObj = SPClientTemplates.FileSystemObjectType;

            if (type == typeObj.File)
                return 'File';
            if (type == typeObj.Folder)
                return 'Folder';
            if (type == typeObj.Web)
                return 'Web';
            return 'Invalid';
        };
        SPClientTemplates.Utility.ChoiceFormatTypeToString = function(formatParam) {
            var formatObj = SPClientTemplates.ChoiceFormatType;

            if (formatParam == formatObj.Radio)
                return 'Radio';
            if (formatParam == formatObj.Dropdown)
                return 'DropDown';
            return 'Invalid';
        };
        SPClientTemplates.Utility.RichTextModeToString = function(mode) {
            var modeObj = SPClientTemplates.RichTextMode;

            if (mode == modeObj.Compatible)
                return 'Compatible';
            if (mode == modeObj.FullHtml)
                return 'FullHtml';
            if (mode == modeObj.HtmlAsXml)
                return 'HtmlAsXml';
            if (mode == modeObj.ThemeHtml)
                return 'ThemeHtml';
            return 'Invalid';
        };
        SPClientTemplates.Utility.IsValidControlMode = function(mode) {
            var modeObj = SPClientTemplates.ClientControlMode;

            return mode == modeObj.NewForm || mode == modeObj.EditForm || mode == modeObj.DisplayForm || mode == modeObj.View;
        };
        SPClientTemplates.Utility.Trim = function(str) {
            if (str == null || typeof str != 'string' || str.length == 0)
                return '';
            if (str.length == 1 && str.charCodeAt(0) == 160)
                return '';
            return (str.replace(/^\s\s*/, '')).replace(/\s\s*$/, '');
        };
        SPClientTemplates.Utility.InitContext = function(webUrl) {
            if (typeof SP != "undefined" && typeof SP.ClientContext != "undefined")
                return new SP.ClientContext(webUrl);
            return null;
        };
        SPClientTemplates.Utility.GetControlOptions = function(ctrlNode) {
            if (ctrlNode == null)
                return null;
            var result;
            var options = ctrlNode.getAttribute("data-sp-options");

            try {
                var script = "(function () { return " + options + "; })();";

                result = eval(script);
            }
            catch (e) {
                result = null;
            }
            return result;
        };
        SPClientTemplates.Utility.UserLookupDelimitString = ';#';
        SPClientTemplates.Utility.UserMultiValueDelimitString = ',#';
        SPClientTemplates.Utility.TryParseInitialUserValue = function(userStr) {
            var uValRes;

            if (userStr == null || userStr == '') {
                uValRes = '';
                return uValRes;
            }
            var lookupIdx = userStr.indexOf(SPClientTemplates.Utility.UserLookupDelimitString);

            if (lookupIdx == -1) {
                uValRes = userStr;
                return uValRes;
            }
            var userValues = userStr.split(SPClientTemplates.Utility.UserLookupDelimitString);

            if (userValues.length % 2 != 0) {
                uValRes = '';
                return uValRes;
            }
            uValRes = [];
            var v = 0;

            while (v < userValues.length) {
                var r = new SPClientFormUserValue();
                var allUserData = userValues[v++];

                allUserData += SPClientTemplates.Utility.UserLookupDelimitString;
                allUserData += userValues[v++];
                r.initFromUserString(allUserData);
                uValRes.push(r);
            }
            return uValRes;
        };
        SPClientTemplates.Utility.TryParseUserControlValue = function(userStr, separator) {
            var userArray = [];

            if (userStr == null || userStr == '')
                return userArray;
            var delimit = separator + ' ';
            var multipleUsers = userStr.split(delimit);

            if (multipleUsers.length == 0)
                return userArray;
            for (var v = 0; v < multipleUsers.length; v++) {
                var uStr = SPClientTemplates.Utility.Trim(multipleUsers[v]);

                if (uStr == '')
                    continue;
                if (uStr.indexOf(SPClientTemplates.Utility.UserLookupDelimitString) != -1) {
                    var r = new SPClientFormUserValue();

                    r.initFromUserString(uStr);
                    userArray.push(r);
                }
                else
                    userArray.push(uStr);
            }
            return userArray;
        };
        SPClientTemplates.Utility.GetPropertiesFromPageContextInfo = function(rCtx) {
        };
        SPClientTemplates.Utility.ReplaceUrlTokens = function(tokenUrl) {
            return SPClientRenderer.ReplaceUrlTokens(tokenUrl);
        };
        function IsCSRReadOnlyTabularView(renderCtx) {
            return renderCtx != null && renderCtx.ListSchema != null && renderCtx.ListSchema.TabularView == "1" && renderCtx.inGridMode != true;
        }
        function SPClientFormUserValue() {
        }
        function SPClientFormUserValue_InitializePrototype() {
            SPClientFormUserValue.prototype.lookupId = '-1';
            SPClientFormUserValue.prototype.lookupValue = '';
            SPClientFormUserValue.prototype.displayStr = '';
            SPClientFormUserValue.prototype.email = '';
            SPClientFormUserValue.prototype.sip = '';
            SPClientFormUserValue.prototype.title = '';
            SPClientFormUserValue.prototype.picture = '';
            SPClientFormUserValue.prototype.department = '';
            SPClientFormUserValue.prototype.jobTitle = '';
            SPClientFormUserValue.prototype.initFromUserString = function(inStr) {
                if (inStr != null && inStr != '') {
                    var userValues = inStr.split(SPClientTemplates.Utility.UserLookupDelimitString);

                    if (userValues.length != 2)
                        return;
                    this.lookupId = userValues[0];
                    var multiValStr = userValues[1];
                    var splitStr = multiValStr.split(SPClientTemplates.Utility.UserMultiValueDelimitString);
                    var numUserValues = splitStr.length;

                    if (numUserValues == 1) {
                        this.title = (this.displayStr = (this.lookupValue = splitStr[0]));
                    }
                    else if (numUserValues >= 5) {
                        this.lookupValue = splitStr[0] == null ? '' : splitStr[0];
                        this.displayStr = splitStr[1] == null ? '' : splitStr[1];
                        this.email = splitStr[2] == null ? '' : splitStr[2];
                        this.sip = splitStr[3] == null ? '' : splitStr[3];
                        this.title = splitStr[4] == null ? '' : splitStr[4];
                        if (numUserValues >= 6) {
                            this.picture = splitStr[5] == null ? '' : splitStr[5];
                            if (numUserValues >= 7) {
                                this.department = splitStr[6] == null ? '' : splitStr[6];
                                if (numUserValues >= 8)
                                    this.jobTitle = splitStr[7] == null ? '' : splitStr[7];
                            }
                        }
                    }
                }
            };
            SPClientFormUserValue.prototype.toString = function() {
                var _lookupDelimitStr = SPClientTemplates.Utility.UserLookupDelimitString;
                var _multiValueDelimitStr = SPClientTemplates.Utility.UserMultiValueDelimitString;
                var uString = this.lookupId;

                uString += _lookupDelimitStr;
                uString += this.lookupValue;
                uString += _multiValueDelimitStr;
                uString += this.displayStr;
                uString += _multiValueDelimitStr;
                uString += this.email;
                uString += _multiValueDelimitStr;
                uString += this.sip;
                uString += _multiValueDelimitStr;
                uString += this.title;
                uString += _multiValueDelimitStr;
                uString += this.picture;
                uString += _multiValueDelimitStr;
                uString += this.department;
                uString += _multiValueDelimitStr;
                uString += this.jobTitle;
                return uString;
            };
        }
        SPClientFormUserValue_InitializePrototype();
        SPClientTemplates.Utility.ParseLookupValue = function(valueStr) {
            var lValue = {
                'LookupId': '0',
                'LookupValue': ''
            };

            if (valueStr == null || valueStr == '')
                return lValue;
            var delimitIdx = valueStr.indexOf(';#');

            if (delimitIdx == -1) {
                lValue.LookupId = valueStr;
                return lValue;
            }
            lValue.LookupId = valueStr.substr(0, delimitIdx);
            lValue.LookupValue = (valueStr.substr(delimitIdx + 2)).replace(/;;/g, ';');
            return lValue;
        };
        SPClientTemplates.Utility.ParseMultiLookupValues = function(valueStr) {
            if (valueStr == null || valueStr == '')
                return [];
            var valueArray = [];
            var valueLength = valueStr.length;
            var beginning = 0, end = 0;
            var bEscapeCharactersFound = false;

            while (end < valueLength) {
                if (valueStr[end] == ';') {
                    if (++end >= valueLength)
                        break;
                    if (valueStr[end] == '#') {
                        if (end - 1 > beginning) {
                            var foundValue = valueStr.substr(beginning, end - beginning - 1);

                            if (bEscapeCharactersFound)
                                foundValue = foundValue.replace(/;;/g, ';');
                            valueArray.push(foundValue);
                            bEscapeCharactersFound = false;
                        }
                        beginning = ++end;
                        continue;
                    }
                    else if (valueStr[end] == ';') {
                        end++;
                        bEscapeCharactersFound = true;
                        continue;
                    }
                    else
                        return [];
                }
                end++;
            }
            if (end > beginning) {
                var lastValue = valueStr.substr(beginning, end - beginning);

                if (bEscapeCharactersFound)
                    lastValue = lastValue.replace(/;;/g, ';');
                valueArray.push(lastValue);
            }
            var resultArray = [];
            var resultLength = valueArray.length;

            for (var resultCount = 0; resultCount < resultLength; resultCount++)
                resultArray.push({
                    'LookupId': valueArray[resultCount++],
                    'LookupValue': valueArray[resultCount]
                });
            return resultArray;
        };
        SPClientTemplates.Utility.BuildLookupValuesAsString = function(choicesArray, isMultiLookup, setGroupDesc) {
            if (choicesArray == null || choicesArray.length == 0)
                return '';
            var choicesStr = '';
            var firstOption = true;

            for (var choiceIdx = 0; choiceIdx < choicesArray.length; choiceIdx++) {
                var curChoice = choicesArray[choiceIdx];

                if (!isMultiLookup) {
                    if (!firstOption)
                        choicesStr += "|";
                    firstOption = false;
                    choicesStr += curChoice.LookupValue.replace(/\x7C/g, "||");
                    choicesStr += "|";
                    choicesStr += curChoice.LookupId;
                }
                else {
                    if (!firstOption)
                        choicesStr += "|t";
                    firstOption = false;
                    choicesStr += curChoice.LookupId;
                    choicesStr += "|t";
                    choicesStr += curChoice.LookupValue.replace(/\x7C/g, "||");
                    if (setGroupDesc)
                        choicesStr += "|t |t ";
                }
            }
            return choicesStr;
        };
        SPClientTemplates.Utility.ParseURLValue = function(valueStr) {
            var urlValue = {
                'URL': 'http://',
                'Description': ''
            };

            if (valueStr == null || valueStr == '')
                return urlValue;
            var idx = 0;

            while (idx < valueStr.length) {
                if (valueStr[idx] == ',') {
                    if (idx == valueStr.length - 1) {
                        valueStr = valueStr.substr(0, valueStr.length - 1);
                        break;
                    }
                    else if (idx + 1 < valueStr.length && valueStr[idx + 1] == ' ') {
                        break;
                    }
                    else {
                        idx++;
                    }
                }
                idx++;
            }
            if (idx < valueStr.length) {
                urlValue.URL = (valueStr.substr(0, idx)).replace(/\,\,/g, ',');
                var remainderLen = valueStr.length - (idx + 2);

                if (remainderLen > 0)
                    urlValue.Description = valueStr.substr(idx + 2, remainderLen);
            }
            else {
                urlValue.URL = valueStr.replace(/\,\,/g, ',');
                urlValue.Description = valueStr.replace(/\,\,/g, ',');
            }
            return urlValue;
        };
        SPClientTemplates.Utility.GetFormContextForCurrentField = function(renderContext) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "Forms not supported in standalone list view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        };
        SPClientTemplates._defaultTemplates = {};
        SPClientTemplates._defaultTemplates['View'] = {
            'default': {
                'all': {}
            }
        };
        SPClientTemplates._defaultTemplates['Header'] = {
            'default': {
                'all': {}
            }
        };
        SPClientTemplates._defaultTemplates['Body'] = {
            'default': {
                'all': {}
            }
        };
        SPClientTemplates._defaultTemplates['Footer'] = {
            'default': {
                'all': {}
            }
        };
        SPClientTemplates._defaultTemplates['Group'] = {};
        SPClientTemplates._defaultTemplates['Item'] = {
            'default': {
                'all': {
                    'Callout': {}
                }
            }
        };
        SPClientTemplates._defaultTemplates['Fields'] = {};
        function RenderViewTemplate(renderCtx) {
            var iStr = renderCtx.RenderHeader(renderCtx);

            iStr += renderCtx.RenderBody(renderCtx);
            iStr += renderCtx.RenderFooter(renderCtx);
            return iStr;
        }
        function RenderFieldValueDefault(renderCtx) {
            if (renderCtx != null && renderCtx.CurrentFieldValue != null)
                return renderCtx.CurrentFieldValue.toString();
            return '';
        }
        var RenderBodyTemplate = function(renderCtx) {
            var itemTpls = renderCtx.Templates['Item'];

            if (itemTpls == null || itemTpls == {})
                return '';
            var listData = renderCtx.ListData;
            var listSchema = renderCtx.ListSchema;
            var bHasHeader = renderCtx.Templates.Header != '';
            var iStr = '';

            if (bHasHeader) {
                if (renderCtx.Templates.Header == null)
                    iStr += RenderTableHeader(renderCtx);
                var aggregate = listSchema.Aggregate;

                if (aggregate != null && listData.Row.length > 0 && !listSchema.groupRender && !renderCtx.inGridMode)
                    iStr += RenderAggregate(renderCtx, null, listData.Row[0], listSchema, null, true, aggregate);
                iStr += '<script id="scriptBody';
                iStr += renderCtx.wpq;
                iStr += '"></script>';
            }
            else {
                iStr = '<table onmousedown="return OnTableMouseDown(event);">';
            }
            if (renderCtx.inGridMode) {
                (function() {
                    if (!false) {
                        if (confirm("Assertion failed: " + "Grid mode not supported in standalone list view." + ". Break into debugger?"))
                            eval("debugger");
                    }
                })();
                ;
                return iStr;
            }
            var group1 = listSchema.group1;
            var group2 = listSchema.group2;
            var expand = listSchema.Collapse == null || listSchema.Collapse != "TRUE";
            var renderGroup = Boolean(renderCtx.ExternalDataList);
            var ItemTpl = renderCtx.Templates['Item'];

            if (ItemTpl == null || ItemTpl == RenderFieldTemplateDefault || typeof ItemTpl != "function" && typeof ItemTpl != "string")
                ItemTpl = RenderItemTemplate;
            else if (typeof ItemTpl == "string")
                ItemTpl = SPClientRenderer.ParseTemplateString(ItemTpl, renderCtx);
            for (var idx = 0; idx < listData.Row.length; idx++) {
                var listItem = listData.Row[idx];

                if (idx == 0) {
                    listItem.firstRow = true;
                    if (group1 != null) {
                        iStr += '<input type="hidden" id="GroupByColFlag"/><input type="hidden" id="GroupByWebPartID';
                        iStr += renderCtx.ctxId;
                        iStr += '" webPartID="';
                        iStr += listSchema.View;
                        iStr += '"/><tbody id="GroupByCol';
                        iStr += listSchema.View;
                        iStr += '"><tr id="GroupByCol';
                        iStr += renderCtx.ctxId;
                        iStr += '" queryString ="';
                        iStr += listData.FilterLink;
                        iStr += '"/></tbody >';
                    }
                }
                var itemType = listItem['ContentType'];
                var tpl = itemTpls[itemType];

                if (tpl == null || tpl == '') {
                    tpl = ItemTpl;
                }
                else if (typeof tpl == 'string') {
                    tpl = SPClientRenderer.ParseTemplateString(tpl, renderCtx);
                    itemTpls[itemType] = tpl;
                }
                if (listSchema.group1 != null) {
                    iStr += RenderGroup(renderCtx, listItem);
                }
                if (expand || renderGroup) {
                    renderCtx.CurrentItem = listItem;
                    renderCtx.CurrentItemIdx = idx;
                    iStr += CoreRender(tpl, renderCtx);
                    renderCtx.CurrentItem = null;
                    renderCtx.CurrentItemIdx = -1;
                }
            }
            iStr += '</table>';
            return iStr;
        };

        function RenderGroupTemplateDefault(rCtx) {
            return rCtx != null && typeof rCtx.RenderGroups == "function" ? rCtx.RenderGroups(rCtx) : '';
        }
        function RenderItemTemplateDefault(rCtx) {
            return rCtx != null && typeof rCtx.RenderItems == "function" ? rCtx.RenderItems(rCtx) : '';
        }
        function RenderFieldTemplateDefault(rCtx) {
            return rCtx != null && typeof rCtx.RenderFields == "function" ? rCtx.RenderFields(rCtx) : '';
        }
        function RenderAggregate(renderCtx, groupId, listItem, listSchema, level, expand, aggregate) {
            var iStr = '';

            if (groupId == null) {
                iStr += '<tbody id="aggr';
                iStr += renderCtx.wpq;
                iStr += '">';
            }
            else {
                iStr = '<tbody id="aggr';
                iStr += groupId;
                iStr += '_"';
                if (!expand)
                    iStr += ' style="display:none"';
                iStr += '>';
            }
            iStr += '<tr id="agg';
            iStr += renderCtx.wpq;
            iStr += '"><td/>';
            var aggLevel = '';

            if (level == 1)
                aggLevel = '.agg';
            else if (level == 2)
                aggLevel = '.agg2';
            var fields = listSchema.Field;

            for (var f in fields) {
                var field = fields[f];

                if (field.GroupField != null)
                    break;
                iStr += '<td class="ms-vb2">';
                var type = aggregate[field.Name];

                if (type != null && type != '') {
                    iStr += '<nobr><b>';
                    var title;
                    var aggName;

                    if (type == 'COUNT') {
                        title = GetString("L_SPCount");
                        aggName = field.Name + '.COUNT' + aggLevel;
                    }
                    if (type == 'SUM') {
                        title = GetString("L_SPSum");
                        aggName = field.Name + '.SUM' + aggLevel;
                    }
                    else if (type == 'AVG') {
                        title = GetString("L_SPAvg");
                        aggName = field.Name + '.AVG' + aggLevel;
                    }
                    else if (type == 'MAX') {
                        title = GetString("L_SPMax");
                        aggName = field.Name + '.MAX' + aggLevel;
                    }
                    else if (type == 'MIN') {
                        title = GetString("L_SPMin");
                        aggName = field.Name + '.MIN' + aggLevel;
                    }
                    else if (type == 'STDEV') {
                        title = GetString("L_SPStdev");
                        aggName = field.Name + '.STDEV' + aggLevel;
                    }
                    else if (type == 'VAR') {
                        title = GetString("L_SPVar");
                        aggName = field.Name + '.VAR' + aggLevel;
                    }
                    else {
                        title = GetString("L_SPCount");
                        aggName = field.Name + '.COUNT' + aggLevel;
                    }
                    iStr += title;
                    iStr += '=&nbsp;';
                    iStr += listItem[aggName];
                    iStr += '</b></nobr>';
                }
                iStr += '</td>';
                if (IsCSRReadOnlyTabularView(renderCtx) && (field.CalloutMenu == "TRUE" || field.listItemMenu == "TRUE")) {
                    iStr += '<td></td>';
                }
            }
            iStr += '</tr></tbody>';
            return iStr;
        }
        function RenderGroupTemplate(renderCtx, group, groupId, listItem, listSchema, level, expand) {
            renderCtx.CurrentItem = listItem;
            var viewCount = renderCtx.ctxId;
            var iStr = '<tbody id="titl';

            iStr += groupId;
            iStr += '" groupString="';
            iStr += listItem[group + '.urlencoded'];
            iStr += '"';
            if (level == 2 && !expand)
                iStr += ' style="display:none"';
            iStr += '><tr><td colspan="100" nowrap="nowrap" class="ms-gb';
            if (level == 2)
                iStr += '2';
            iStr += '">';
            if (level == 2)
                iStr += '<img src=' + ListView.ImageBasePath + '"/_layouts/15/images/blank.gif?rev=33"' + ' alt="" height="1" width="10">';
            iStr += '<a href="javascript:" onclick="javascript:ExpCollGroup(';
            iStr += "'";
            iStr += groupId;
            iStr += "', 'img_";
            iStr += groupId;
            iStr += "',event, false);return false;";
            iStr += '">';
            var groupOuterClass = null;
            var groupImgClass = null;

            if (DOM.rightToLeft) {
                groupOuterClass = expand ? "ms-commentcollapsertl-iconouter" : "ms-commentexpandrtl-iconouter";
                groupImgClass = expand ? "ms-commentcollapsertl-icon" : "ms-commentexpandrtl-icon";
            }
            else {
                groupOuterClass = expand ? "ms-commentcollapse-iconouter" : "ms-commentexpand-iconouter";
                groupImgClass = expand ? "ms-commentcollapse-icon" : "ms-commentexpand-icon";
            }
            var groupImgAlt = expand ? GetString("L_SPCollapse") : GetString("L_SPExpand");

            iStr += '<span class="';
            iStr += groupOuterClass;
            iStr += '"><img class="';
            iStr += groupImgClass;
            iStr += '" src="';
            iStr += GetThemedImageUrl("spcommon.png");
            iStr += '" alt="';
            iStr += groupImgAlt;
            iStr += '" id="img_';
            iStr += groupId;
            iStr += '" /></span>';
            var displayName = group;
            var curField;

            for (var idx = 0; idx < listSchema.Field.length; idx++) {
                var field = listSchema.Field[idx];

                if (field.Name == group) {
                    displayName = field.DisplayName;
                    curField = field;
                    break;
                }
            }
            iStr += Encoding.HtmlEncode(displayName);
            iStr += '</a> : ';
            if (curField != null) {
                if (curField.Type == 'Number' || curField.Type == 'Currency')
                    iStr += listItem[field.Name];
                else if (curField.Type == 'DateTime')
                    iStr += listItem[field.Name + '.groupdisp'];
                else if (curField.Type == 'User' || curField.Type == 'UserMulti')
                    iStr += listItem[field.Name + '.span'];
                else {
                    renderCtx.CurrentItemIdx = idx;
                    iStr += spMgr.RenderFieldByName(renderCtx, group, listItem, listSchema);
                    renderCtx.CurrentItemIdx = -1;
                }
            }
            iStr += ' <span style="font-weight: lighter; display: inline-block;">(';
            iStr += level == 2 ? listItem[group + '.COUNT.group2'] : listItem[group + '.COUNT.group'];
            iStr += ')</span></td></tr></tbody>';
            var aggregate = listSchema.Aggregate;

            if (aggregate != null && !renderCtx.inGridMode)
                iStr += RenderAggregate(renderCtx, groupId, listItem, listSchema, level, expand, aggregate);
            renderCtx.CurrentItem = null;
            return iStr;
        }
        function RenderGroup(renderCtx, listItem) {
            return RenderGroupEx(renderCtx, listItem, false);
        }
        function RenderGroupEx(renderCtx, listItem, omitLevel2) {
            var listSchema = renderCtx.ListSchema;
            var group1 = listSchema.group1;
            var group2 = listSchema.group2;
            var expand = listSchema.Collapse == null || listSchema.Collapse != "TRUE";
            var groupId = renderCtx.ctxId;
            var renderGroup = Boolean(renderCtx.ExternalDataList);
            var iStr = "";
            var groupTpls = renderCtx.Templates['Group'];

            if (groupTpls == null || groupTpls == RenderItemTemplateDefault || typeof groupTpls != "function" && typeof groupTpls != "string")
                groupTpls = RenderGroupTemplate;
            else if (typeof groupTpls == "string")
                groupTpls = SPClientRenderer.ParseTemplateString(groupTpls, renderCtx);
            groupId += '-';
            groupId += listItem[group1 + '.groupindex'];
            if (listItem[group1 + '.newgroup'] == '1') {
                iStr += groupTpls(renderCtx, group1, groupId, listItem, listSchema, 1, expand);
            }
            if (listItem[group1 + '.newgroup'] == '1' || group2 != null && listItem[group2 + '.newgroup'] == '1') {
                if (group2 != null && !omitLevel2) {
                    groupId += listItem[group2 + '.groupindex2'];
                    iStr += groupTpls(renderCtx, group2, groupId, listItem, listSchema, 2, expand);
                }
                iStr += AddGroupBody(groupId, expand, renderGroup);
            }
            return iStr;
        }
        function AddGroupBody(groupId, expand, renderGroup) {
            var iStr = '<tbody id="tbod';

            iStr += groupId;
            iStr += '_"';
            if (!expand && renderGroup)
                iStr += ' style="display: none;"';
            iStr += ' isLoaded="';
            if (expand || renderGroup)
                iStr += 'true';
            else
                iStr += 'false';
            iStr += '"/>';
            return iStr;
        }
        function GenerateIID(renderCtx) {
            return GenerateIIDForListItem(renderCtx, renderCtx.CurrentItem);
        }
        function GenerateIIDForListItem(renderCtx, listItem) {
            return renderCtx.ctxId + ',' + listItem.ID + ',' + listItem.FSObjType;
        }
        function GetCSSClassForFieldTd(renderCtx, field) {
            var listSchema = renderCtx.ListSchema;

            if (field.CalloutMenu == 'TRUE' || renderCtx.inGridMode && (field.ClassInfo == 'Menu' || field.listItemMenu == 'TRUE'))
                return 'ms-cellstyle ms-vb-title';
            else if (field.ClassInfo == 'Menu' || field.listItemMenu == 'TRUE')
                return 'ms-cellstyle ms-vb-title ms-positionRelative';
            else if (field.ClassInfo == 'Icon')
                return 'ms-cellstyle ms-vb-icon';
            else if ((field.Type == 'User' || field.Type == 'UserMulti') && listSchema.EffectivePresenceEnabled)
                return 'ms-cellstyle ms-vb-user';
            else
                return 'ms-cellstyle ms-vb2';
        }
        function DoesListUseCallout(renderCtx) {
            for (var i = 0; i < renderCtx.ListSchema.Field.length; i++) {
                var field = renderCtx.ListSchema.Field[i];

                if (field.CalloutMenu != null && field.CalloutMenu.toLowerCase() == "true") {
                    return true;
                }
            }
            return false;
        }
        function ShowCallOutOrECBWrapper(elm, evt, fShowCallout) {
            return ShowECBMenuForTr(elm, evt);
        }
        window['ShowCallOutOrECBWrapper'] = ShowCallOutOrECBWrapper;
        var RenderItemTemplate = function(renderCtx) {
            var listItem = renderCtx.CurrentItem;
            var listSchema = renderCtx.ListSchema;
            var idx = renderCtx.CurrentItemIdx;
            var cssClass = idx % 2 == 1 ? "ms-alternating " : "";

            if (FHasRowHoverBehavior(renderCtx)) {
                cssClass += " ms-itmHoverEnabled ";
            }
            var ret = [];

            ret.push('<tr class="');
            ret.push(cssClass);
            if (listSchema.TabularView != undefined && listSchema.TabularView == "1") {
                ret.push('ms-itmhover');
                ret.push('" oncontextmenu="');
                if (DoesListUseCallout(renderCtx)) {
                    ret.push("return ShowCallOutOrECBWrapper(this, event, true)");
                }
                else {
                    ret.push("return ShowCallOutOrECBWrapper(this, event, false)");
                }
            }
            ret.push('" iid="');
            var iid = GenerateIID(renderCtx);

            ret.push(iid);
            ret.push('" id="');
            ret.push(iid);
            ret.push('">');
            if (listSchema.TabularView != undefined && listSchema.TabularView == "1") {
                ret.push('<td class="ms-cellStyleNonEditable ms-vb-itmcbx ms-vb-imgFirstCell" tabindex=0><div role="checkbox" class="s4-itm-cbx s4-itm-imgCbx" tabindex="-1"><span class="s4-itm-imgCbx-inner"><span class="ms-selectitem-span"><img class="ms-selectitem-icon" alt="" src="');
                ret.push(GetThemedImageUrl("spcommon.png"));
                ret.push('"/></span></span></div></td>');
            }
            var fields = listSchema ? listSchema.Field : null;

            for (var fldIdx = 0; fldIdx < fields.length; fldIdx++) {
                var field = fields[fldIdx];

                if (field.GroupField != null)
                    break;
                ret.push('<td class="');
                if (fldIdx == fields.length - 1 && field.CalloutMenu != 'TRUE' && field.listItemMenu != 'TRUE') {
                    ret.push('ms-vb-lastCell ');
                }
                if (field.css == null) {
                    field.css = GetCSSClassForFieldTd(renderCtx, field);
                    if (field.CalloutMenu == 'TRUE' || field.ClassInfo == 'Menu' || field.listItemMenu == 'TRUE') {
                        field.css += '" IsECB="TRUE';
                        if (field.CalloutMenu == 'TRUE') {
                            field.css += '" IsCallOut="TRUE';
                        }
                        if (field.ClassInfo == 'Menu' || field.listItemMenu == 'TRUE') {
                            field.css += '" height="100%';
                        }
                    }
                }
                renderCtx.CurrentFieldSchema = field;
                ret.push(field.css);
                ret.push('">');
                ret.push(spMgr.RenderField(renderCtx, field, listItem, listSchema));
                ret.push('</td>');
                renderCtx.CurrentFieldSchema = null;
            }
            ret.push('</tr>');
            return ret.join('');
        };

        function RenderTableHeader(renderCtx) {
            var listSchema = renderCtx.ListSchema;
            var listData = renderCtx.ListData;
            var ret = [];

            RenderHeroButton(ret, renderCtx);
            if (Boolean(listSchema.InplaceSearchEnabled)) {
                var controlDivId = 'CSRListViewControlDiv' + renderCtx.wpq;

                ret.push("<div class=\"ms-csrlistview-controldiv\" id=\"");
                ret.push(Encoding.HtmlEncode(controlDivId));
                ret.push("\">");
            }
            else
                ret.push("<div>");
            if (listSchema.RenderViewSelectorPivotMenu == "True")
                ret.push(RenderViewSelectorPivotMenu(renderCtx));
            else if (listSchema.RenderViewSelectorPivotMenuAsync == "True")
                ret.push(RenderViewSelectorPivotMenuAsync(renderCtx));
            var ManageListsPermission = renderCtx.BasePermissions.ManageLists;
            var ManagePersonalViewsPermission = renderCtx.BasePermissions.ManagePersonalViews;

            if (listSchema.RenderSaveAsNewViewButton == "True" && (ManageListsPermission || ManagePersonalViewsPermission != null && ManagePersonalViewsPermission)) {
                ret.push('<div id="CSRSaveAsNewViewDiv');
                ret.push(renderCtx.wpq);
                ret.push('" class="ms-InlineSearch-DivBaseline" style="visibility:hidden;padding-bottom:3px;"');
                ret.push('><a class="ms-commandLink" href="#" id="CSRSaveAsNewViewAnchor');
                ret.push(renderCtx.wpq);
                ret.push('" saveViewButtonDisabled="false" onclick="EnsureScriptParams(\'inplview\', \'ShowSaveAsNewViewDialog\', \'');
                ret.push(renderCtx.listName + '\', \'');
                ret.push(renderCtx.view + '\', \'');
                ret.push(renderCtx.wpq + '\', \'');
                ret.push(ManageListsPermission + '\', \'');
                ret.push(ManagePersonalViewsPermission);
                ret.push('\'); return false;" >');
                ret.push(GetString("L_SaveThisViewButton.toUpperCase()"));
                ret.push('</a></div>');
            }
            ret.push("</div>");
            ret.push('<iframe src="javascript:false;" id="FilterIframe');
            ret.push(renderCtx.ctxId);
            ret.push('" name="FilterIframe');
            ret.push(renderCtx.ctxId);
            ret.push('" style="display:none" height="0" width="0" FilterLink="');
            ret.push(listData.FilterLink);
            ret.push('"></iframe>');
            ret.push("<table onmousedown='return OnTableMouseDown(event);' summary=\"");
            ret.push(Encoding.HtmlEncode(renderCtx.ListTitle));
            ret.push('" xmlns:o="urn:schemas-microsoft-com:office:office" o:WebQuerySourceHref="');
            ret.push(renderCtx.HttPath);
            ret.push('&XMLDATA=1&RowLimit=0&View=');
            ret.push(URI_Encoding.encodeURIComponent(listSchema.View));
            ret.push('" border="0" cellspacing="0" dir="');
            ret.push(listSchema.Direction);
            ret.push('" onmouseover="EnsureSelectionHandler(event,this,');
            ret.push(renderCtx.ctxId);
            ret.push(')" cellpadding="1" id="');
            if (listSchema.IsDocLib || typeof listData.Row == 'undefined')
                ret.push("onetidDoclibViewTbl0");
            else {
                ret.push(renderCtx.listName);
                ret.push('-');
                ret.push(listSchema.View);
            }
            ret.push('" class="');
            if (typeof listData.Row == 'undefined')
                ret.push('ms-emptyView');
            else
                ret.push("ms-listviewtable");
            ret.push('">');
            return ret.join('');
        }
        function RenderSelectAllCbx(renderCtx, ret) {
            if (ret == null) {
                ret = [];
            }
            ret.push('<span class="ms-selectall-span" tabindex="0" onfocus="EnsureSelectionHandlerOnFocus(event,this,');
            ret.push(renderCtx.ctxId);
            ret.push(');" id="cbxSelectAllItems');
            ret.push(renderCtx.ctxId);
            ret.push('" title="');
            ret.push(GetString("L_select_deselect_all"));
            ret.push('"><span tabindex="-1" class="ms-selectall-iconouter"><img class="ms-selectall-icon" alt="" src="');
            ret.push(GetThemedImageUrl("spcommon.png"));
            ret.push('" /></span></span></span>');
            AddPostRenderCallback(renderCtx, function() {
                var selectAll = document.getElementById('cbxSelectAllItems' + renderCtx.ctxId);
                var evt = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click';

                $addHandler(selectAll, evt, function() {
                    selectAll.checked = !selectAll.checked;
                    (function() {
                        if (!false) {
                            if (confirm("Assertion failed: " + "Standalone list view does not (yet) support item selection" + ". Break into debugger?"))
                                eval("debugger");
                        }
                    })();
                    ;
                });
            });
            return ret;
        }
        var RenderHeaderTemplate = function(renderCtx, fRenderHeaderColumnNames) {
            var listSchema = renderCtx.ListSchema;
            var listData = renderCtx.ListData;
            var ret = [];

            if (fRenderHeaderColumnNames == null) {
                fRenderHeaderColumnNames = true;
            }
            ret.push(RenderTableHeader(renderCtx));
            ret.push('<thead id="');
            ret.push("js-listviewthead-" + renderCtx.wpq);
            ret.push('"><tr valign="top" class="ms-viewheadertr');
            if (DOM.rightToLeft)
                ret.push(' ms-vhrtl');
            else
                ret.push(' ms-vhltr');
            ret.push('">');
            if (listSchema.TabularView != undefined && listSchema.TabularView == "1") {
                ret.push('<th class="ms-headerCellStyleIcon ms-vh-icon ms-vh-selectAllIcon" scope="col">');
                RenderSelectAllCbx(renderCtx, ret);
                ret.push('</th>');
            }
            if (fRenderHeaderColumnNames) {
                var fields = listSchema ? listSchema.Field : null;
                var counter = 1;

                for (var f in fields) {
                    var field = fields[f];

                    if (field.DisplayName == null)
                        continue;
                    if (field.GroupField != null)
                        break;
                    field.counter = counter++;
                    ret.push(spMgr.RenderHeader(renderCtx, field));
                    if (IsCSRReadOnlyTabularView(renderCtx) && (field.CalloutMenu == "TRUE" || field.listItemMenu == "TRUE"))
                        ret.push("<th></th>");
                }
            }
            if (listSchema.TabularView == "1" && renderCtx.BasePermissions.ManageLists && renderCtx.ListTemplateType != 160) {
                ret.push('<th class="ms-vh-icon" scope="col" title=""><span class="ms-addcolumn-span"> </span></th>');
            }
            ret.push("</tr>");
            ret.push("</thead>");
            return ret.join('');
        };
        var RenderFooterTemplate = function(renderCtx) {
            var ret = [];

            RenderEmptyText(ret, renderCtx);
            RenderPaging(ret, renderCtx);
            return ret.join('');
        };

        function RenderViewSelectorMenu(renderCtx) {
            var openMenuText = Encoding.HtmlEncode(GetString("L_OpenMenu_Text"));
            var viewSelectorMenuId = Encoding.HtmlEncode(renderCtx.wpq + '_LTViewSelectorMenu');
            var viewSelectorLinkId = Encoding.HtmlEncode(renderCtx.wpq + '_ListTitleViewSelectorMenu');
            var viewSelectorTopSpanId = Encoding.HtmlEncode(renderCtx.wpq + '_ListTitleViewSelectorMenu_t');
            var viewSelectorContainerId = Encoding.HtmlEncode(renderCtx.wpq + '_ListTitleViewSelectorMenu_Container');
            var currentViewTitle = renderCtx.viewTitle;

            if (currentViewTitle == null || currentViewTitle == '')
                currentViewTitle = GetString("L_ViewSelectorCurrentView");
            var showMergeView = renderCtx.ListSchema.ViewSelector_ShowMergeView ? 'true' : 'false';
            var showRepairView = renderCtx.ListSchema.ViewSelector_ShowRepairView ? 'true' : 'false';
            var showCreateView = renderCtx.ListSchema.ViewSelector_ShowCreateView ? 'true' : 'false';
            var showEditView = renderCtx.ListSchema.ViewSelector_ShowEditView ? 'true' : 'false';
            var showApproveView = renderCtx.ListSchema.ViewSelector_ShowApproveView ? 'true' : 'false';
            var viewParameters = renderCtx.ListSchema.ViewSelector_ViewParameters;

            if (viewParameters == null)
                viewParameters = '';
            var onClick = [];

            onClick.push('onclick="try { CoreInvoke(\'showViewSelector\', event, document.getElementById(\'');
            onClick.push(viewSelectorContainerId);
            onClick.push('\'), { showRepairView : ');
            onClick.push(showRepairView);
            onClick.push(', showMergeView : ');
            onClick.push(showMergeView);
            onClick.push(', showEditView : ');
            onClick.push(showEditView);
            onClick.push(', showCreateView : ');
            onClick.push(showCreateView);
            onClick.push(', showApproverView : ');
            onClick.push(showApproveView);
            onClick.push(', listId: \'');
            onClick.push(renderCtx.listName);
            onClick.push('\', viewId: \'');
            onClick.push(renderCtx.view);
            onClick.push('\', viewParameters: \'');
            onClick.push(viewParameters);
            onClick.push('\' }); } catch (ex) { }; return false;" ');
            var onClickHandler = onClick.join('');
            var ret = [];

            ret.push('<span data-sp-cancelWPSelect="true" id="');
            ret.push(viewSelectorContainerId);
            ret.push('" class="ms-csrlistview-viewselectormenu"><span id="');
            ret.push(viewSelectorTopSpanId);
            ret.push('" class="ms-menu-althov ms-viewselector" title="');
            ret.push(Encoding.HtmlEncode(GetString("L_ViewSelectorTitle")));
            ret.push('" hoveractive="ms-menu-althov-active ms-viewselectorhover" hoverinactive="ms-menu-althov ms-viewselector" ');
            ret.push('foa="MMU_GetMenuFromClientId(\'');
            ret.push(viewSelectorLinkId);
            ret.push('\')" onmouseover="MMU_PopMenuIfShowing(this); MMU_EcbTableMouseOverOut(this, true)" ');
            ret.push('oncontextmenu="ClkElmt(this); return false;" ');
            ret.push(onClickHandler);
            ret.push('>');
            ret.push('<a class="ms-menu-a" id="');
            ret.push(viewSelectorLinkId);
            ret.push('" accesskey="');
            ret.push(Encoding.HtmlEncode(GetString("L_SelectBackColorKey_TEXT")));
            ret.push('" href="#" ');
            ret.push(onClickHandler);
            ret.push('oncontextmenu="ClkElmt(this); return false;" onfocus="MMU_EcbLinkOnFocusBlur(byid(\'');
            ret.push(viewSelectorMenuId);
            ret.push('\'), this, true);" oncontextmenu="ClkElmt(this); return false;" ');
            ret.push('onkeydown="MMU_EcbLinkOnKeyDown(byid(\'');
            ret.push(viewSelectorMenuId);
            ret.push('\'), MMU_GetMenuFromClientId(\'');
            ret.push(viewSelectorLinkId);
            ret.push('\'), event);" menutokenvalues="MENUCLIENTID=');
            ret.push(viewSelectorLinkId);
            ret.push(',TEMPLATECLIENTID=');
            ret.push(viewSelectorMenuId);
            ret.push('" serverclientid="');
            ret.push(viewSelectorLinkId);
            ret.push('"><span class="ms-viewselector-currentView">');
            ret.push(Encoding.HtmlEncode(currentViewTitle));
            ret.push('</span></a>');
            ret.push('<span style="height:');
            ret.push(4);
            ret.push('px;width:');
            ret.push(7);
            ret.push('px;position:relative;display:inline-block;overflow:hidden;" class="s4-clust ms-viewselector-arrow ms-menu-stdarw">');
            ret.push('<img src="');
            ret.push(ListView.ImageBasePath + "/_layouts/15/images/fgimg.png?rev=33");
            ret.push('" alt="');
            ret.push(openMenuText);
            ret.push('" style="border-width:0px;position:absolute;left:-');
            ret.push(0);
            ret.push('px !important;top:-');
            ret.push(262);
            ret.push('px !important;" /></span>');
            ret.push('<span style="height:');
            ret.push(4);
            ret.push('px;width:');
            ret.push(7);
            ret.push('px;position:relative;display:inline-block;overflow:hidden;" class="s4-clust ms-viewselector-arrow ms-menu-hovarw">');
            ret.push('<img src="');
            ret.push(ListView.ImageBasePath + "/_layouts/15/images/fgimg.png?rev=33");
            ret.push('" alt="');
            ret.push(openMenuText);
            ret.push('" style="border-width:0px;position:absolute;left:-');
            ret.push(0);
            ret.push('px !important;top:-');
            ret.push(266);
            ret.push('px !important;" /></span>');
            ret.push('</span></span>');
            return ret.join('');
        }
        function RenderViewSelectorPivotMenu(renderCtx) {
            var pivotOpts = {
                PivotContainerId: renderCtx.wpq + '_ListTitleViewSelectorMenu_Container'
            };
            var viewMenu = new ClientPivotControl(pivotOpts);
            var allOpts = renderCtx.ListSchema.ViewSelectorPivotMenuOptions;

            if (allOpts == null || allOpts == '')
                return '';
            var viewData = eval(renderCtx.ListSchema.ViewSelectorPivotMenuOptions);
            var idx;

            for (idx = 0; idx < viewData.length; idx++) {
                var viewOpt = viewData[idx];

                if (viewOpt.GroupId >= 500 || viewOpt.MenuOptionType != ClientPivotControl.MenuOptionType.MenuOption)
                    break;
                viewOpt.SelectedOption = renderCtx.viewTitle == viewOpt.DisplayText;
                viewMenu.AddMenuOption(viewOpt);
            }
            if (idx > 0) {
                if (idx < 3)
                    viewMenu.SurfacedPivotCount = idx;
                for (; idx < viewData.length; idx++) {
                    var overflowItem = viewData[idx];

                    if (overflowItem.MenuOptionType == ClientPivotControl.MenuOptionType.MenuOption) {
                        overflowItem.SelectedOption = renderCtx.viewTitle == overflowItem.DisplayText;
                        viewMenu.AddMenuOption(overflowItem);
                    }
                    else if (overflowItem.MenuOptionType == ClientPivotControl.MenuOptionType.MenuSeparator) {
                        viewMenu.AddMenuSeparator();
                    }
                }
            }
            return viewMenu.RenderAsString();
        }
        function RenderViewSelectorPivotMenuAsync(renderCtx) {
            var pivotOpts = {
                PivotContainerId: renderCtx.wpq + '_ListTitleViewSelectorMenu_Container'
            };
            var viewMenu = new ClientPivotControl(pivotOpts);

            viewMenu.SurfacedPivotCount = 1;
            var dispTitle = renderCtx.viewTitle;

            if (dispTitle == null || dispTitle == '')
                dispTitle = GetString("L_ViewSelectorCurrentView");
            var curOpt = new ClientPivotControlMenuOption();

            curOpt.DisplayText = dispTitle;
            curOpt.OnClickAction = 'return false;';
            curOpt.SelectedOption = true;
            viewMenu.AddMenuOption(curOpt);
            viewMenu.OverflowMenuScript = "OpenViewSelectorPivotOptions(event, '" + renderCtx.ctxId + "'); return false;";
            return viewMenu.RenderAsString();
        }
        function OpenViewSelectorPivotOptions(evt, renderCtxId) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "View selector pivot options not supported in standalone list view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            return;
        }
        function RenderEmptyText(ret, renderCtx) {
            if (renderCtx.inGridMode) {
                return;
            }
            var listData = renderCtx.ListData;

            if (listData.Row.length == 0) {
                var listSchema = renderCtx.ListSchema;
                var iStr = '<table class="';
                var hasSearchTerm = typeof renderCtx.completedSearchTerm != "undefined" && renderCtx.completedSearchTerm != null;

                iStr += 'ms-list-emptyText-compact ms-textLarge';
                iStr += '" dir="';
                iStr += listSchema.Direction;
                iStr += '" border="0">';
                iStr += '<tr id="empty-';
                iStr += renderCtx.wpq;
                iStr += '"><td colspan="99">';
                var listTemplate = renderCtx.ListTemplateType;

                if (hasSearchTerm) {
                    iStr += GetString("L_NODOCSEARCH");
                }
                else if (listSchema.IsDocLib) {
                    var viewTitle = renderCtx.viewTitle;

                    if (Boolean(viewTitle))
                        iStr += (GetString("L_NODOC")).replace("%0", Encoding.HtmlEncode(viewTitle));
                    else
                        iStr += GetString("L_NODOCView");
                }
                else if (listTemplate == 160) {
                    iStr += GetString("L_AccRqEmptyView");
                }
                else {
                    iStr += Encoding.HtmlEncode(listSchema.NoListItem);
                }
                iStr += '</td></tr></table>';
                ret.push(iStr);
            }
        }
        function RenderSearchStatus(ret, renderCtx) {
            ret.push('<tr><td>' + RenderSearchStatusInner(ret, renderCtx) + '</td></tr>');
        }
        function RenderSearchStatusInner(ret, renderCtx) {
            return '<div id="inplaceSearchDiv_' + renderCtx.wpq + '_lsstatus"></div>';
        }
        function RenderPaging(ret, renderCtx) {
            var listData = renderCtx.ListData;

            if (listData != null && (listData.PrevHref != null || listData.NextHref != null)) {
                var wpq = renderCtx.wpq;
                var listSchema = renderCtx.ListSchema;

                ret.push('<table border="0" cellpadding="0" cellspacing="0" class="ms-bottompaging" id="bottomPaging');
                ret.push(wpq);
                ret.push('"><tr><td class="ms-vb ms-bottompagingline" id="bottomPagingCell');
                if (!listSchema.groupRender) {
                    ret.push(wpq);
                    ret.push('" align="center">');
                }
                else
                    ret.push('">');
                var str = [];
                var isRtl = window.document.documentElement.getAttribute("dir") == "rtl";

                str.push("<table><tr>");
                if (listData.PrevHref != null) {
                    str.push("<td id=\"paging");
                    str.push(wpq + "prev");
                    str.push("\"><a title=\"");
                    str.push(GetString("L_SPClientPrevious"));
                    str.push("\" onclick='RefreshPageTo(event, \"");
                    str.push(listData.PrevHref);
                    str.push("\");return false;'");
                    str.push(" href=\"javascript:\" class=\"ms-commandLink ms-promlink-button ms-promlink-button-enabled\"><span class=\"ms-promlink-button-image\"><img src=\"");
                    str.push(GetThemedImageUrl("spcommon.png"));
                    str.push("\" border=\"0\" class=\"");
                    if (isRtl)
                        str.push("ms-promlink-button-right");
                    else
                        str.push("ms-promlink-button-left");
                    str.push("\" alt=\"");
                    str.push(GetString("L_SPClientPrevious"));
                    str.push("\"></a></td>");
                }
                str.push("<td class=\"ms-paging\">");
                str.push(listData.FirstRow);
                str.push(" - ");
                str.push(listData.LastRow);
                str.push("</td>");
                if (listData.NextHref != null) {
                    str.push("<td id=\"paging");
                    str.push(wpq + "next");
                    str.push("\"><a title=\"");
                    str.push(GetString("L_SPClientNext"));
                    str.push("\" onclick='RefreshPageTo(event, \"");
                    str.push(listData.NextHref);
                    str.push("\");return false;'");
                    str.push(" href=\"javascript:\" class=\"ms-commandLink ms-promlink-button ms-promlink-button-enabled\"><span class=\"ms-promlink-button-image\"><img src=\"");
                    str.push(GetThemedImageUrl("spcommon.png"));
                    str.push("\" border=\"0\" class=\"");
                    if (isRtl)
                        str.push("ms-promlink-button-left");
                    else
                        str.push("ms-promlink-button-right");
                    str.push("\" alt=\"");
                    str.push(GetString("L_SPClientNext"));
                    str.push("\"></a></td>");
                }
                str.push("</tr></table>");
                var pagingStr = str.join('');
                var topPagingCell = document.getElementById("topPagingCell" + wpq);

                if (topPagingCell != null) {
                    topPagingCell.innerHTML = pagingStr;
                }
                ret.push(pagingStr);
                ret.push('</td></tr>');
                RenderSearchStatus(ret, renderCtx);
                ret.push('</table>');
            }
            else {
                ret.push('<table border="0" cellpadding="0" cellspacing="0" class="ms-bottompaging" id="bottomPaging">');
                RenderSearchStatus(ret, renderCtx);
                ret.push('</table>');
            }
        }
        function RenderPagingControlNew(ret, renderCtx, fRenderitemNumberRange, strClassName, strId) {
            var listData = renderCtx.ListData;
            var strTopDiv = "<div class=\"%CLASS_NAME%\" id=\"%ID_NAME%\" style=\"padding:2px;\" >";
            var strPrevNext = "<a onclick='RefreshPageTo(event, \"%PREV_OR_NEXT_PAGE%\");return false;' href=\"javascript:\" ><img alt=\"%PREV_OR_NEXT_ALT%\" src=\"%PREV_OR_NEXT_IMG%\" alt=\"\" /></a>";
            var strPageNums = "<span class=\"ms-paging\">%FIRST_ROW% - %LAST_ROW% </span>";

            ret.push((strTopDiv.replace(/%CLASS_NAME%/, strClassName)).replace(/%ID_NAME%/, strId));
            if (listData != null && (listData.PrevHref != null || listData.NextHref != null)) {
                var wpq = renderCtx.wpq;
                var listSchema = renderCtx.ListSchema;
                var strUrlPathToImg = ListView.ImageBasePath + "/_layouts/15/" + listSchema.LCID + "/images/";

                if (listData.PrevHref != null) {
                    var strPrev = strPrevNext.replace(/%PREV_OR_NEXT_PAGE%/, listData.PrevHref);

                    strPrev = strPrev.replace(/%PREV_OR_NEXT_IMG%/, strUrlPathToImg + "prev.gif");
                    strPrev = strPrev.replace(/%PREV_OR_NEXT_ALT%/, GetString("L_SlideShowPrevButton_Text"));
                    ret.push(strPrev);
                }
                if (fRenderitemNumberRange) {
                    ret.push((strPageNums.replace(/%FIRST_ROW%/, listData.FirstRow)).replace(/%LAST_ROW%/, listData.FirstRow));
                }
                if (listData.NextHref != null) {
                    var strNext = strPrevNext.replace(/%PREV_OR_NEXT_PAGE%/, listData.NextHref);

                    strNext = strNext.replace(/%PREV_OR_NEXT_IMG%/, strUrlPathToImg + "next.gif");
                    strNext = strNext.replace(/%PREV_OR_NEXT_ALT%/, GetString("L_SlideShowNextButton_Text"));
                    ret.push(strNext);
                }
            }
            ret.push(RenderSearchStatusInner(ret, renderCtx));
            ret.push("</div>");
        }
        function RenderHeroParameters(renderCtx, delay) {
            if (renderCtx == null) {
                throw "Error: Ctx can not be null in RenderHeroParameters";
            }
            var listSchema = renderCtx.ListSchema;
            var wpq = renderCtx.wpq;

            this.isDocLib = listSchema.IsDocLib;
            this.listTemplate = renderCtx.ListTemplateType;
            this.WOPIEnabled = Boolean(renderCtx.NewWOPIDocumentEnabled);
            this.canUpload = CanUploadFile(renderCtx);
            this.hasInlineEdit = renderCtx.AllowGridMode && !listSchema.IsDocLib && this.listTemplate != 123;
            var canDragUpload = false;

            this.canDragUpload = canDragUpload && !(listTemplate == 119 || listTemplate == 123);
            var heroId = "idHomePageNewItem";
            var addNewText = GetString("L_SPAddNewItem");
            var listTemplate = this.listTemplate;

            if (listTemplate == 104) {
                heroId = "idHomePageNewAnnouncement";
                addNewText = GetString("L_SPAddNewAnnouncement");
            }
            else if (listTemplate == 101 || listTemplate == 700 || listTemplate == 702) {
                if (this.WOPIEnabled) {
                    heroId = addWPQtoId(c_newdocWOPIID + 'Hero', wpq);
                }
                else {
                    heroId = "idHomePageNewDocument-" + wpq;
                }
                addNewText = GetString("L_SPAddNewDocument");
            }
            else if (listTemplate == 115) {
                heroId = "idHomePageNewItem-" + wpq;
                addNewText = GetString("L_SPAddNewDocument");
            }
            else if (listTemplate == 123) {
                addNewText = GetString("L_SPAddNewDocument");
            }
            else if (listTemplate == 103) {
                heroId = "idHomePageNewLink";
                addNewText = GetString("L_SPAddNewLink");
            }
            else if (listTemplate == 106) {
                heroId = "idHomePageNewEvent";
                addNewText = GetString("L_SPAddNewEvent");
            }
            else if (listTemplate == 107 || listTemplate == 150 || listTemplate == 171) {
                addNewText = GetString("L_SPAddNewTask");
            }
            else if (listTemplate == 109) {
                heroId = "idHomePageNewPicture";
                addNewText = GetString("L_SPAddNewPicture");
            }
            else if (listTemplate == 119) {
                heroId = "idHomePageNewWikiPage";
                addNewText = GetString("L_SPAddNewWiki");
            }
            else if (listTemplate == 1230) {
                addNewText = GetString("L_SPAddNewDevApp");
            }
            else if (listTemplate == 330 || listTemplate == 332) {
                addNewText = GetString("L_SPAddNewApp");
            }
            this.heroId = heroId;
            this.addNewText = addNewText;
            var url;

            if (listTemplate == 119) {
                (function() {
                    if (!false) {
                        if (confirm("Assertion failed: " + "Standalone list view doesn't (yet) support listTemplate 119" + ". Break into debugger?"))
                            eval("debugger");
                    }
                })();
                ;
            }
            else if (renderCtx.ListSchema.IsDocLib) {
                (function() {
                    if (!false) {
                        if (confirm("Assertion failed: " + "Standalone list view doesn't (yet) support doclib upload" + ". Break into debugger?"))
                            eval("debugger");
                    }
                })();
                ;
            }
            else if (listTemplate == 1230) {
                (function() {
                    if (!false) {
                        if (confirm("Assertion failed: " + "Standalone list view doesn't (yet) support developer app listTemplate" + ". Break into debugger?"))
                            eval("debugger");
                    }
                })();
                ;
            }
            else {
                url = renderCtx.newFormUrl;
            }
            this.addNewUrl = url;
            this.largeSize = Boolean(listSchema.InplaceSearchEnabled);
        }
        function RenderHeroParameters_InitializePrototype() {
            RenderHeroParameters.prototype = {
                isDocLib: false,
                listTemplate: -1,
                canDragUpload: true,
                WOPIEnabled: false,
                hasInlineEdit: false,
                heroId: '',
                addNewText: '',
                addNewUrl: '',
                largeSize: false
            };
        }
        RenderHeroParameters_InitializePrototype();
        function RenderHeroLink(renderCtx, delay) {
            if (renderCtx.inGridMode) {
                var slink = "<a class=\"ms-heroCommandLink\" href=\"javascript:;\" onclick=\"ExitGrid('";

                slink += renderCtx.view;
                slink += "'); return false;\"";
                slink += " title=";
                slink += Encoding.AttrQuote(GetString("L_SPStopEditingTitle"));
                slink += ">";
                return ((GetString("L_SPStopEditingList")).replace(/{(1)}/, "</a>")).replace(/{(0)}/, slink);
            }
            var heroParam = new RenderHeroParameters(renderCtx, delay);

            if (!Boolean(heroParam))
                return "";
            renderCtx.heroId = heroParam.heroId;
            var retString;

            if (heroParam.isDocLib && !renderCtx.inGridMode && true) {
                renderCtx.qcbNewButtonConfigured = false;
                var uploadUrl = renderCtx.HttpRoot + "/_layouts/15/Upload.aspx" + '?List=' + renderCtx.listName + '&RootFolder=' + renderCtx.rootFolder;
                var qcbDef = {
                    "buttonClass": (heroParam.largeSize ? "ms-textXLarge" : "ms-textLarge") + " ms-heroCommandLink js-qcb-button",
                    "disabledClass": "ms-disabled",
                    "onDestroyed": function() {
                        OnQCBDestroyed(renderCtx);
                    },
                    "left": [{
                        "title": GetString("L_SPClientNew"),
                        "glyphClass": "ms-listview-glyph",
                        "glyph": "&#xE200;",
                        "buttonClass": "js-listview-qcbNewButton",
                        "tooltip": GetString("L_SPClientNewTooltip"),
                        "accessKey": GetString("L_SPClientNewAK"),
                        "onClick": function(evt) {
                            HandleQCBNewButtonPress(evt, heroParam);
                        },
                        "shouldEnable": function(buttonInfo) {
                            return ShouldEnableQCBNewButton(buttonInfo, renderCtx, heroParam);
                        }
                    }, {
                        "title": GetString("L_SPClientSync"),
                        "glyphClass": "ms-listview-glyph",
                        "glyph": "&#xE034;",
                        "buttonClass": "js-listview-qcbSyncButton",
                        "tooltip": GetString("L_SPClientSyncTooltip"),
                        "accessKey": GetString("L_SPClientSyncAK"),
                        "onClick": function(evt) {
                            HandleQCBSyncButtonPress(evt, renderCtx);
                        },
                        "shouldEnable": function(buttonInfo) {
                            return ShouldEnableQCBSyncButton(buttonInfo, heroParam, renderCtx);
                        }
                    }, {
                        "title": GetString("L_SPClientEdit"),
                        "glyphClass": "ms-listview-glyph",
                        "glyph": "&#xE027;",
                        "buttonClass": "js-listview-qcbEditButton",
                        "tooltip": GetString("L_SPClientEditTooltip"),
                        "accessKey": GetString("L_SPClientEditAK"),
                        "onClick": function(evt) {
                            HandleQCBEditButtonPress(evt, renderCtx.wpq);
                        },
                        "shouldEnable": function(buttonInfo) {
                            return ShouldEnableQCBEditButton(buttonInfo, renderCtx.wpq);
                        }
                    }, {
                        "title": GetString("L_SPClientManage"),
                        "glyphClass": "ms-listview-glyph",
                        "glyph": "&#xE077;",
                        "buttonClass": "js-listview-qcbManageButton",
                        "tooltip": GetString("L_SPClientManageTooltip"),
                        "accessKey": GetString("L_SPClientManageAK"),
                        "onClick": function(evt) {
                            HandleQCBManageButtonPress(evt, renderCtx);
                        },
                        "shouldEnable": function(buttonInfo) {
                            return ShouldEnableQCBManageButton(buttonInfo, renderCtx);
                        }
                    }, {
                        "title": GetString("L_SPClientShare"),
                        "glyphClass": "ms-listview-glyph",
                        "glyph": "&#xE078;",
                        "buttonClass": "js-listview-qcbShareButton",
                        "tooltip": GetString("L_SPClientShareTooltip"),
                        "accessKey": GetString("L_SPClientShareAK"),
                        "onClick": function(evt) {
                            HandleQCBShareButtonPress(evt, renderCtx.wpq);
                        },
                        "shouldEnable": function(buttonInfo) {
                            return ShouldEnableQCBShareButton(buttonInfo, renderCtx.wpq);
                        }
                    }]
                };

                if (!heroParam.largeSize) {
                    qcbDef.left.splice(1, 1);
                    qcbDef.left.splice(2, 1);
                }
                renderCtx.qcb = new QCB(qcbDef);
                retString = "<div class=\"ms-listview-qcbContainer\"></div>";
                AddPostRenderCallback(renderCtx, RenderDocumentLibraryQCB);
            }
            else {
                var newLink = RenderHeroAddNewLink(heroParam, renderCtx);

                if (heroParam.isDocLib && heroParam.listTemplate != 119 && heroParam.canDragUpload) {
                    retString = GetString("L_SPAddNewAndDrag");
                    retString = retString.replace(/{(0)}/, newLink);
                }
                else if (!heroParam.isDocLib && heroParam.hasInlineEdit) {
                    retString = GetString("L_SPAddNewAndEdit");
                    var aTag = "<a class=\"ms-heroCommandLink\" href=\"javascript:;\" onclick=\"EnsureScriptParams('inplview', 'InitGridFromView', '";

                    aTag += renderCtx.view;
                    aTag += "'); return false;\"";
                    aTag += " title=\"";
                    aTag += GetString("L_SPEditListTitle");
                    aTag += "\">";
                    retString = ((retString.replace(/{(0)}/, newLink)).replace(/{(1)}/, aTag)).replace(/{(2)}/, '</a>');
                }
                else {
                    retString = newLink;
                }
            }
            return retString;
        }
        function RenderDocumentLibraryQCB(renderCtx) {
            var containerElement = document.querySelector("#Hero-" + renderCtx.wpq + " .ms-listview-qcbContainer");

            if (!Boolean(containerElement)) {
                return;
            }
            if (!Boolean(renderCtx.qcb)) {
                return;
            }
            renderCtx.qcb.Render(containerElement);
        }
        function OnQCBDestroyed(renderCtx) {
        }
        function CloseAllMenusAndCallouts() {
        }
        function ShouldEnableQCBNewButton(buttonInfo, renderCtx, heroParam) {
            return false;
        }
        function HandleQCBNewButtonPress(evt, heroParam) {
            CloseAllMenusAndCallouts();
        }
        function ShouldEnableQCBEditButton(buttonInfo, wpq) {
        }
        function HandleQCBEditButtonPress(evt, wpq) {
        }
        function ShouldEnableQCBManageButton(buttonInfo, renderCtx) {
            return false;
        }
        function HandleQCBManageButtonPress(evt, renderCtx) {
        }
        function ShouldEnableQCBShareButton(buttonInfo, wpq) {
        }
        function HandleQCBShareButtonPress(evt, wpq) {
        }
        function ShouldEnableQCBSyncButton(buttonInfo, heroParam, renderCtx) {
            return false;
        }
        var g_syncButtonUsePopup;

        function HandleQCBSyncButtonPress(evt, renderCtx) {
        }
        function RenderHeroAddNewLink(heroParam, renderCtx) {
            var ret = [];

            ret.push('<a id="');
            ret.push(heroParam.heroId);
            ret.push('" class="ms-heroCommandLink"');
            ret.push(' href="');
            ret.push(heroParam.addNewUrl);
            ret.push('"');
            if (!heroParam.WOPIEnabled) {
                ret.push(' data-viewCtr="');
                ret.push(renderCtx.ctxId);
                ret.push("\" onclick=\"NewItem2(event, &quot;");
                ret.push(heroParam.addNewUrl);
                ret.push("&quot;); return false;\" target=\"_self\"");
            }
            ret.push(" title=\"");
            ret.push(GetString("L_SPAddNewItemTitle"));
            ret.push("\">");
            if (heroParam.largeSize) {
                ret.push("<span class=\"ms-list-addnew-imgSpan20\">");
            }
            else {
                ret.push("<span class=\"ms-list-addnew-imgSpan16\">");
            }
            ret.push('<img id="');
            ret.push(heroParam.heroId + '-img');
            ret.push('" src="');
            ret.push(GetThemedImageUrl("spcommon.png"));
            if (heroParam.largeSize) {
                ret.push('" class="ms-list-addnew-img20"/>');
            }
            else {
                ret.push('" class="ms-list-addnew-img16"/>');
            }
            ret.push("</span><span>");
            ret.push(heroParam.addNewText);
            ret.push("</span></a>");
            if (heroParam.WOPIEnabled) {
                AddPostRenderCallback(renderCtx, CreateNewDocumentCallout);
            }
            return ret.join('');
        }
        function ShouldRenderHeroButton(renderCtx) {
            var listSchema = renderCtx.ListSchema;

            return !Boolean(renderCtx.DisableHeroButton) && (!listSchema.IsDocLib || (CanUploadFile(renderCtx) || renderCtx.ListTemplateType == 119 || Boolean(renderCtx.NewWOPIDocumentEnabled))) && listSchema.FolderRight_AddListItems != null && (listSchema.Toolbar == 'Freeform' || typeof window['heroButtonWebPart' + renderCtx.wpq] != 'undefined' && listSchema.Toolbar == 'Standard');
        }
        function CanUploadFile(renderCtx) {
            return false;
        }
        function RenderHeroButton(ret, renderCtx) {
            function NewButtonRedirection() {
                var WPQ = renderCtx.wpq;

                if (eval("typeof DefaultNewButtonWebPart" + WPQ + " != 'undefined'")) {
                    if (Boolean(renderCtx.heroId)) {
                        var eleLink = document.getElementById(renderCtx.heroId);

                        if (eleLink != null)
                            eval("DefaultNewButtonWebPart" + WPQ + "(eleLink);");
                    }
                }
            }
            var listSchema = renderCtx.ListSchema;
            var wpq = renderCtx.wpq;

            if (!ShouldRenderHeroButton(renderCtx)) {
                return;
            }
            ret.push('<table id="Hero-');
            ret.push(wpq);
            ret.push('" dir="');
            ret.push(listSchema.Direction);
            ret.push('" cellpadding="0" cellspacing="0" border="0"');
            if (listSchema.IsDocLib && !renderCtx.inGridMode && true)
                ret.push(' class="ms-fullWidth"');
            ret.push('>');
            ret.push('<tr><td class="ms-list-addnew ');
            if (listSchema.InplaceSearchEnabled) {
                if (!(listSchema.IsDocLib && !renderCtx.inGridMode && true))
                    ret.push('ms-textXLarge ');
                ret.push('ms-list-addnew-aligntop');
            }
            else {
                ret.push('ms-textLarge');
            }
            ret.push(' ms-soften">');
            ret.push(RenderHeroLink(renderCtx, false));
            ret.push('</td></tr>');
            ret.push('</table>');
            if (renderCtx.ListTemplateType == 115) {
                AddPostRenderCallback(renderCtx, function() {
                    setTimeout(NewButtonRedirection, 0);
                });
            }
        }
        var DocumentType = {
            Invalid: 0,
            Word: 1,
            Excel: 2,
            PowerPoint: 3,
            OneNote: 4,
            ExcelForm: 5,
            Folder: 6,
            Max: 7
        };

        DocumentInformation.prototype = {
            type: undefined,
            idToken: undefined,
            imgSrc: undefined,
            imgAlt: undefined,
            textLabel: undefined
        };
        function DocumentInformation(typeIn, idTokenIn, imgSrcIn, imgAltIn, textLabelIn) {
            this.type = typeIn;
            this.idToken = idTokenIn;
            this.imgSrc = imgSrcIn;
            this.imgAlt = imgAltIn;
            this.textLabel = textLabelIn;
        }
        var c_newdocWOPIID = 'js-newdocWOPI-';
        var c_newDocDivHtml = ['<a id="{0}" class="ms-newdoc-callout-item ms-displayBlock" onclick="{5}" href="#">', '<img id="{1}" src="{2}" alt="{3}" class="ms-verticalAlignMiddle ms-newdoc-callout-img"/>', '<h3 id="{4}" class="ms-displayInline ms-newdoc-callout-text ms-verticalAlignMiddle ms-soften">{6}</h3></a>'].join('');
        var c_onClickCreateDoc = 'CalloutManager.closeAll(); OpenPopUpPageWithTitle(&quot;{0}&TemplateType={1}&quot;, OnCloseDialogNavigate); return false;';
        var c_newDocCalloutWidth = parseInt(GetString("L_NewDocumentCalloutSize"));
        var NewDocumentInfo = InitializeNewDocumentInfo();

        function InitializeNewDocumentInfo() {
            var docInfo = {};

            docInfo[DocumentType.Word] = new DocumentInformation(DocumentType.Word, 'Word', ListView.ImageBasePath + "/_layouts/15/images/lg_icdocx.png?rev=33", GetString("L_NewDocumentWordImgAlt"), GetString("L_NewDocumentWord"));
            docInfo[DocumentType.Excel] = new DocumentInformation(DocumentType.Excel, 'Excel', ListView.ImageBasePath + "/_layouts/15/images/lg_icxlsx.png?rev=33", GetString("L_NewDocumentExcelImgAlt"), GetString("L_NewDocumentExcel"));
            docInfo[DocumentType.PowerPoint] = new DocumentInformation(DocumentType.PowerPoint, 'PowerPoint', ListView.ImageBasePath + "/_layouts/15/images/lg_icpptx.png?rev=33", GetString("L_NewDocumentPowerPointImgAlt"), GetString("L_NewDocumentPowerPoint"));
            docInfo[DocumentType.OneNote] = new DocumentInformation(DocumentType.OneNote, 'OneNote', ListView.ImageBasePath + "/_layouts/15/images/lg_icont.png?rev=33", GetString("L_NewDocumentOneNoteImgAlt"), GetString("L_NewDocumentOneNote"));
            docInfo[DocumentType.ExcelForm] = new DocumentInformation(DocumentType.ExcelForm, 'ExcelForm', ListView.ImageBasePath + "/_layouts/15/images/lg_icxlsx.png?rev=33", GetString("L_NewDocumentExcelFormImgAlt"), GetString("L_NewDocumentExcelForm"));
            docInfo[DocumentType.Folder] = new DocumentInformation(DocumentType.Folder, 'Folder', ListView.ImageBasePath + "/_layouts/15/images/mb_folder.png?rev=33", GetString("L_NewDocumentFolderImgAlt"), GetString("L_NewDocumentFolder"));
            return docInfo;
        }
        function NewDocumentCallout_OnOpenedCallback(rCtx) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "Callouts not supported in standalone list view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            return;
        }
        function CreateNewDocumentCallout(rCtx, launchPointOverride) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "Callouts not supported in standalone list view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            return;
        }
        function GetNewDocumentCalloutMainID(rCtx) {
            return addWPQtoId(c_newdocWOPIID + 'divMain-', rCtx.wpq);
        }
        function TryLaunchExcelForm(createDocumentUrl) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "Excel form not supported in standalone list view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            return;
        }
        function RenderNewDocumentCallout(renderCtx, createDocumentUrl) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "Callouts not supported in standalone list view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            return "";
        }
        function RenderNewFolderUrl(renderCtx) {
            var ret = [];

            ret.push("alert('Standalone list view does not yet support New Folder');");
            return ret.join('');
        }
        function addWPQtoId(id, wpq) {
            if (Boolean(id) && Boolean(wpq)) {
                if (id.lastIndexOf('-') == id.length - 1)
                    return id + wpq;
                else
                    return id + '-' + wpq;
            }
            else
                return id;
        }
        function DisplayErrorDialog(dialogTitle, errorMsg) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "Error dialog not supported in standalone list view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function RenderTitle(titleText, renderCtx, listItem, listSchema, title, isLinkToItem) {
            titleText.push("<a class=\"ms-listlink\" onfocus=\"OnLink(this)\" href=\"");
            titleText.push(ListModule.Util.createItemPropertiesTitleUrl(renderCtx, listItem));
            titleText.push("\" onclick=\"");
            AddUIInstrumentationClickEvent(titleText, listItem, 'Navigation');
            titleText.push("EditLink2(this,");
            titleText.push(renderCtx.ctxId);
            titleText.push(");return false;\" target=\"_self\">");
            titleText.push(Boolean(listSchema.HasTitle) || Boolean(isLinkToItem) ? title : Encoding.HtmlEncode(title));
            titleText.push("</a>");
        }
        function LinkTitleValue(titleValue) {
            if (titleValue == '')
                return GetString("L_SPClientNoTitle");
            else
                return titleValue;
        }
        function HasEditPermission(listItem) {
            var permMask = listItem.PermMask;

            return (parseInt("0x" + permMask.substring(permMask.length - 1)) & 0x4) != 0;
        }
        var ComputedFieldWorker = (function() {
            function NewGif(listItem, listSchema, ret) {
                if (listItem["Created_x0020_Date.ifnew"] == "1") {
                    var spCommonSrc = GetThemedImageUrl("spcommon.png");

                    ret.push("<span class=\"ms-newdocument-iconouter\"><img class=\"ms-newdocument-icon\" src=\"");
                    ret.push(spCommonSrc);
                    ret.push("\" alt=\"");
                    ret.push(GetString("L_SPClientNew"));
                    ret.push("\" title=\"");
                    ret.push(GetString("L_SPClientNew"));
                    ret.push("\" /></span>");
                }
            }
            function GenBlogLink(link, altText, position, titleText, descText, listSchema, listItem) {
                var ret = [];

                ret.push("<span style=\"vertical-align:middle\">");
                ret.push("<span style=\"height:16px;width:16px;position:relative;display:inline-block;overflow:hidden;\" class=\"s4-clust\"><a href=\"");
                ret.push(link);
                GenPostLink(ret, listSchema, listItem);
                ret.push("\" style=\"height:16px;width:16px;display:inline-block;\" ><img src=\"" + ListView.ImageBasePath + "/_layouts/15/images/fgimg.png?rev=33" + "\" alt=\"");
                ret.push(altText);
                ret.push("\" style=\"left:-0px !important;top:");
                ret.push(position);
                ret.push("px !important;position:absolute;\" title=\"");
                ret.push(titleText);
                ret.push("\" class=\"imglink\" longDesc=\"");
                ret.push(descText);
                ret.push("\"></a>");
                ret.push("</span>");
                ret.push("</span>");
                return ret.join('');
            }
            function GenPostLink(ret, listSchema, listItem) {
                ret.push(listSchema.HttpVDir);
                ret.push("/Lists/Posts/Post.aspx?ID=");
                ret.push(listItem.ID);
            }
            function GetFolderIconSourcePath(listItem) {
                if (listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapico"] == '')
                    return ListView.ImageBasePath + "/_layouts/15/images/folder.gif?rev=33";
                else
                    return ListView.ImageBasePath + "/_layouts/15/images/" + listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapico"];
            }
            function LinkFilenameNoMenu(listItem, listSchema) {
                var ret = [];
                var fileUrl = listItem.FileRef;

                fileUrl = listSchema.serverUrl + fileUrl;
                if (fileUrl != null && typeof fileUrl != 'undefined' && fileUrl != "") {
                    if (listItem.FSObjType == '1') {
                        if (listSchema.IsDocLib == '1') {
                            RenderDocFolderLink(ret, listItem.FileLeafRef, listItem, listSchema);
                        }
                        else {
                            RenderListFolderLink(ret, listItem.FileLeafRef, listItem, listSchema);
                        }
                    }
                    else {
                        ret.push("<a class='ms-listlink' href=\"");
                        ret.push(fileUrl);
                        ret.push("\" onmousedown=\"return VerifyHref(this,event,'");
                        ret.push(listSchema.DefaultItemOpen);
                        ret.push("','");
                        ret.push(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"]);
                        ret.push("','");
                        ret.push(listItem["serverurl.progid"]);
                        ret.push("')\" onclick=\"");
                        AddUIInstrumentationClickEvent(ret, listItem, 'Navigation');
                        ret.push("return DispEx(this,event,'TRUE','FALSE','");
                        ret.push(listItem["File_x0020_Type.url"]);
                        ret.push("','");
                        ret.push(listItem["File_x0020_Type.progid"]);
                        ret.push("','");
                        ret.push(listSchema.DefaultItemOpen);
                        ret.push("','");
                        ret.push(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"]);
                        ret.push("','");
                        ret.push(listItem["HTML_x0020_File_x0020_Type"]);
                        ret.push("','");
                        ret.push(listItem["serverurl.progid"]);
                        ret.push("','");
                        ret.push(Boolean(listItem["CheckoutUser"]) ? listItem["CheckoutUser"][0].id : '');
                        ret.push("','");
                        ret.push(listSchema.Userid);
                        ret.push("','");
                        ret.push(listSchema.ForceCheckout);
                        ret.push("','");
                        ret.push(listItem.IsCheckedoutToLocal);
                        ret.push("','");
                        ret.push(listItem.PermMask);
                        ret.push("')\">");
                        var fileRef = listItem["FileLeafRef"];

                        if (fileRef != null) {
                            var index = fileRef.lastIndexOf('.');

                            fileRef = index >= 0 ? fileRef.substring(0, index) : fileRef;
                        }
                        ret.push(fileRef);
                        ret.push("</a>");
                        NewGif(listItem, listSchema, ret);
                    }
                }
                else {
                    ret.push("<nobr>");
                    ret.push(listItem["FileLeafRef"]);
                    ret.push("</nobr>");
                }
                return ret.join('');
            }
            function RenderType(renderCtx, field, listItem, listSchema) {
                var ret = [];

                if (listItem.FSObjType == '1') {
                    var strMaintainUserChrome = fMaintainUserChrome() ? "&MaintainUserChrome=true" : "";

                    ret.push("<a href=\"");
                    ret.push(listSchema.PagePath);
                    ret.push("?RootFolder=");
                    ret.push(URI_Encoding.encodeURIComponent(listItem.FileRef));
                    ret.push(listSchema.ShowWebPart);
                    ret.push("&FolderCTID=");
                    ret.push(listItem.ContentTypeId);
                    ret.push("&View=");
                    ret.push(URI_Encoding.encodeURIComponent(listSchema.View));
                    ret.push(strMaintainUserChrome);
                    ret.push("\" onmousedown=\"VerifyFolderHref(this, event, '");
                    ret.push(listItem["File_x0020_Type.url"]);
                    ret.push("','");
                    ret.push(listItem["File_x0020_Type.progid"]);
                    ret.push("','");
                    ret.push(listSchema.DefaultItemOpen);
                    ret.push("', '");
                    ret.push(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"]);
                    ret.push("', '");
                    ret.push(listItem["HTML_x0020_File_x0020_Type"]);
                    ret.push("', '");
                    ret.push(listItem["serverurl.progid"]);
                    ret.push("')\" onclick=\"");
                    AddUIInstrumentationClickEvent(ret, listItem, 'Navigation');
                    ret.push("return HandleFolder(this,event,'");
                    ret.push(listSchema.PagePath);
                    ret.push("?RootFolder=");
                    ret.push(URI_Encoding.encodeURIComponent(listItem.FileRef));
                    ret.push(listSchema.ShowWebPart);
                    ret.push("&FolderCTID=");
                    ret.push(listItem.ContentTypeId);
                    ret.push("&View=");
                    ret.push(URI_Encoding.encodeURIComponent(listSchema.View));
                    ret.push(strMaintainUserChrome);
                    ret.push("','TRUE','FALSE','");
                    ret.push(listItem["File_x0020_Type.url"]);
                    ret.push("','");
                    ret.push(listItem["File_x0020_Type.progid"]);
                    ret.push("','");
                    ret.push(listSchema.DefaultItemOpen);
                    ret.push("','");
                    ret.push(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"]);
                    ret.push("','");
                    ret.push(listItem["HTML_x0020_File_x0020_Type"]);
                    ret.push("','");
                    ret.push(listItem["serverurl.progid"]);
                    ret.push("','");
                    ret.push(Boolean(listItem["CheckoutUser"]) ? listItem["CheckoutUser"][0].id : '');
                    ret.push("','");
                    ret.push(listSchema.Userid);
                    ret.push("','");
                    ret.push(listSchema.ForceCheckout);
                    ret.push("','");
                    ret.push(listItem.IsCheckedoutToLocal);
                    ret.push("','");
                    ret.push(listItem.PermMask);
                    ret.push("');\"><img border=\"0\" alt=\"");
                    ret.push(listItem.FileLeafRef);
                    ret.push("\" title=\"");
                    ret.push(listItem.FileLeafRef);
                    ret.push("\" src=\"");
                    ret.push(GetFolderIconSourcePath(listItem));
                    ret.push("\" />");
                    if (typeof listItem.IconOverlay != 'undefined' && listItem.IconOverlay != '') {
                        ret.push("<img width=\"16\" height=\"16\" src=\"" + ListView.ImageBasePath + "/_layouts/15/images/");
                        ret.push(listItem["IconOverlay.mapoly"]);
                        ret.push("\" class=\"ms-vb-icon-overlay\" alt=\"\" title=\"\" />");
                    }
                    ret.push("</a>");
                }
                else {
                    if (listSchema.IsDocLib == '1') {
                        if (typeof listItem.IconOverlay == 'undefined' || listItem.IconOverlay == '') {
                            if (typeof listItem["CheckoutUser"] == 'undefined' || listItem["CheckoutUser"] == '') {
                                ret.push('<img width=\"16\" height=\"16\" border="0" alt="');
                                ret.push(listItem.FileLeafRef);
                                ;
                                ret.push('" title="');
                                ret.push(listItem.FileLeafRef);
                                ;
                                ret.push('" src="' + ListView.ImageBasePath + '/_layouts/15/images/');
                                ret.push(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapico"]);
                                ret.push('"');
                                if (Boolean(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.isIconDynamic"])) {
                                    ret.push(' onclick="this.style.display=\'none\';"');
                                }
                                ret.push('/>');
                            }
                            else {
                                ret.push('<img width="16" height="16" border="0" alt="');
                                var alttext = listItem.FileLeafRef + "&#10;" + GetString("L_SPCheckedoutto") + ": " + (Boolean(listItem["CheckoutUser"]) ? Encoding.HtmlEncode(listItem["CheckoutUser"][0].title) : '');

                                ret.push(alttext);
                                ret.push('" title="');
                                ret.push(alttext);
                                ret.push('" src="' + ListView.ImageBasePath + '/_layouts/15/images/');
                                ret.push(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapico"]);
                                ret.push('" /><img src="' + ListView.ImageBasePath + '/_layouts/15/images/checkoutoverlay.gif' + '" class="ms-vb-icon-overlay" alt="');
                                ret.push(alttext);
                                ret.push('" title="');
                                ret.push(alttext);
                                ret.push('" />');
                            }
                        }
                        else {
                            RegularDocImage(listItem["IconOverlay.mapico"]);
                            ret.push('<img width="16" height="16" src="' + ListView.ImageBasePath + '/_layouts/15/images/');
                            ret.push(listItem["IconOverlay.mapoly"]);
                            ret.push('" class="ms-vb-icon-overlay" alt="" title="" />');
                        }
                    }
                    else {
                        RegularDocImage(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapico"]);
                    }
                }
                function RegularDocImage(url) {
                    ret.push("<img width=\"16\" height=\"16\" border=\"0\" alt=\"");
                    ret.push(listItem.FileLeafRef);
                    ret.push("\" title=\"");
                    ret.push(listItem.FileLeafRef);
                    ret.push("\" src=\"" + ListView.ImageBasePath + "/_layouts/15/images/");
                    ret.push(url);
                    ret.push("\"/>");
                }
                return ret.join('');
            }
            function RenderListTitle(renderCtx, field, listItem, listSchema) {
                return RenderLinkToItem(renderCtx, listItem, listSchema, listItem.Title);
            }
            function RenderLinkToItem(renderCtx, listItem, listSchema, linkText) {
                var ret = [];

                if (listItem.FSObjType == '1') {
                    if (listSchema.IsDocLib == '1') {
                        RenderDocFolderLink(ret, LinkTitleValue(linkText), listItem, listSchema);
                    }
                    else {
                        RenderListFolderLink(ret, LinkTitleValue(linkText), listItem, listSchema);
                    }
                }
                else {
                    RenderTitle(ret, renderCtx, listItem, listSchema, LinkTitleValue(linkText));
                }
                NewGif(listItem, listSchema, ret);
                return ret.join('');
            }
            function RenderThumbnail(renderCtx, field, listItem, listSchema) {
                var ret = [];

                ret.push('<a href="' + EncodeUrl(listItem["FileRef"]) + '">');
                ret.push('<img galleryimg="false" border="0"');
                ret.push(' id="' + listItem.ID + 'webImgShrinked"');
                if (field.Name != "PreviewOnForm") {
                    ret.push(' class="ms-displayBlock"');
                }
                var maxSize = (field.Name == "PreviewOnForm" ? "256" : "128") + "px";

                ret.push(' style="max-width: ' + maxSize + '; max-height: ' + maxSize + '; margin:auto; visibility: hidden;"');
                ret.push(' onerror="displayGenericDocumentIcon(event.srcElement ? event.srcElement : event.target, ' + listItem.FSObjType + '); return false;"');
                ret.push(' onload="(event.srcElement ? event.srcElement : event.target).style.visibility = \'visible\';"');
                ret.push(' alt="');
                var comments = listItem["_Comments"];

                if (comments != null && comments != '') {
                    ret.push(Encoding.HtmlEncode(comments));
                }
                else {
                    ret.push(GetString("L_ImgAlt_Text"));
                }
                ret.push('" src="' + EncodeUrl(getDocumentIconAbsoluteUrl(listItem, 256, renderCtx)) + '"/>');
                ret.push('</a>');
                return ret.join('');
            }
            return {
                URLwMenu: function(renderCtx, field, listItem, listSchema) {
                    var retValue;

                    if (listItem.FSObjType == '1') {
                        var ret = [];

                        ret.push("<a onfocus=\"OnLink(this)\" href=\"SubmitFormPost()\" onclick=\"ClearSearchTerm('");
                        ret.push(listSchema.View);
                        ret.push("');ClearSearchTerm('');SubmitFormPost('");
                        ret.push(listSchema.PagePath);
                        ret.push("?RootFolder=");
                        ret.push(URI_Encoding.encodeURIComponent(listItem.FileRef));
                        ret.push(listSchema.ShowWebPart);
                        ret.push("&FolderCTID=");
                        ret.push(listItem.ContentTypeId);
                        ret.push("');return false;\">");
                        ret.push(listItem.FileLeafRef);
                        ret.push("</a>");
                        retValue = ret.join('');
                    }
                    else {
                        retValue = RenderUrl(listItem, "URL", listSchema, field, true);
                    }
                    return retValue;
                },
                URLNoMenu: function(renderCtx, field, listItem, listSchema) {
                    return RenderUrl(listItem, "URL", listSchema, field, true);
                },
                mswh_Title: function(renderCtx, field, listItem, listSchema) {
                    var ret = [];

                    ret.push('<a onfocus="OnLink(this)" href="');
                    ret.push(listItem.FileRef);
                    ret.push('" onclick="LaunchWebDesigner(');
                    ret.push("'");
                    ret.push(listItem.FileRef);
                    ret.push("','design'); return false;");
                    ret.push('">');
                    ret.push(LinkTitleValue(listItem.Title));
                    ret.push('</a>');
                    return ret.join('');
                },
                LinkTitle: RenderListTitle,
                LinkTitleNoMenu: RenderListTitle,
                Edit: function(renderCtx, field, listItem, listSchema) {
                    if (HasEditPermission(listItem)) {
                        var id = ResolveId(listItem, listSchema);
                        var ret = [];

                        ret.push("<a href=\"");
                        ret.push(renderCtx.editFormUrl);
                        ret.push("&ID=");
                        ret.push(id);
                        ret.push("\" onclick=\"EditItemWithCheckoutAlert(event, '");
                        ret.push(renderCtx.editFormUrl);
                        ret.push("&ID=");
                        ret.push(id);
                        ret.push("', '");
                        ret.push(EditRequiresCheckout(listItem, listSchema));
                        ret.push("', '");
                        ret.push(listItem.IsCheckedoutToLocal);
                        ret.push("', '");
                        ret.push(escape(listItem.FileRef));
                        ret.push("', '");
                        ret.push(listSchema.HttpVDir);
                        ret.push("', '");
                        ret.push(listItem.CheckedOutUserId);
                        ret.push("', '");
                        ret.push(listSchema.Userid);
                        ret.push("');return false;\" target=\"_self\">");
                        ret.push("<img border=\"0\" alt=\"");
                        ret.push(GetString("L_SPClientEdit"));
                        ret.push("\" src=\"" + ListView.ImageBasePath + "/_layouts/15/images/edititem.gif?rev=33" + "\"/></a>");
                        return ret.join('');
                    }
                    else {
                        return "&nbsp;";
                    }
                },
                DocIcon: RenderType,
                MasterPageIcon: RenderType,
                LinkFilename: function(renderCtx, field, listItem, listSchema) {
                    return LinkFilenameNoMenu(listItem, listSchema);
                },
                LinkFilenameNoMenu: function(renderCtx, field, listItem, listSchema) {
                    return LinkFilenameNoMenu(listItem, listSchema);
                },
                NumCommentsWithLink: function(renderCtx, field, listItem, listSchema) {
                    var ret = [];

                    ret.push(GenBlogLink("", GetString("L_SPClientNumComments"), "-396", GetString("L_SPClientNumComments"), GetString("L_SPClientNumComments"), listSchema, listItem));
                    ret.push("<span><a href=\"");
                    GenPostLink(ret, listSchema, listItem);
                    ret.push("\">&nbsp;");
                    ret.push(listItem.NumComments);
                    ret.push("&nbsp;");
                    ret.push("Comment(s)");
                    ret.push("</a></span>");
                    return ret.join('');
                },
                EmailPostLink: function(renderCtx, field, listItem, listSchema) {
                    return GenBlogLink("javascript:navigateMailToLink('", GetString("L_SPEmailPostLink"), "-267", GetString("L_SPEmailPostLink"), GetString("L_SPEmailPostLink"), listSchema, listItem);
                },
                Permalink: function(renderCtx, field, listItem, listSchema) {
                    return GenBlogLink("", "Permanent Link to Post", "-412", "Permanent Link to Post", "Permanent Link to Post", listSchema, listItem);
                },
                CategoryWithLink: function(renderCtx, field, listItem, listSchema) {
                    var ret = [];

                    ret.push("<a class=\"static menu-item\" href=\"");
                    ret.push(listSchema.HttpVDir);
                    ret.push("/");
                    ret.push("lists/Categories/Category.aspx?CategoryId=");
                    ret.push(listItem.ID);
                    ret.push("\" id=\"blgcat");
                    ret.push(listItem.ID);
                    ret.push("\"><span class=\"additional-backgroud\"><span class=\"menu-item-text\">");
                    ret.push(listItem.Title);
                    ret.push("</span></span></a>");
                    return ret.join('');
                },
                LinkIssueIDNoMenu: function(renderCtx, field, listItem, listSchema) {
                    var ret = [];

                    ret.push("<a href=\"");
                    ret.push(renderCtx.displayFormUrl);
                    ret.push("&ID=");
                    ret.push(listItem.ID);
                    ret.push("\" onclick=\"");
                    AddUIInstrumentationClickEvent(ret, listItem, 'Navigation');
                    ret.push("EditLink2(this,");
                    ret.push(renderCtx.ctxId);
                    ret.push(");return false;\" target=\"_self\">");
                    ret.push(listItem.ID);
                    ret.push("</a>");
                    return ret.join('');
                },
                SelectTitle: function(renderCtx, field, listItem, listSchema) {
                    if (listSchema.SelectedID == listItem.ID || listSchema.SelectedID == '-1' && listItem.firstRow == true)
                        return '<img border="0" align="absmiddle" style="cursor: hand" src="' + ListView.ImageBasePath + '/_layouts/15/images/rbsel.gif' + '" alt="' + GetString("L_SPSelected") + '" />';
                    else {
                        var ret = [];

                        ret.push("<a href=\"javascript:SelectField('");
                        ret.push(listSchema.View);
                        ret.push("','");
                        ret.push(listItem.ID);
                        ret.push("');return false;\" onclick=\"SelectField('");
                        ret.push(listSchema.View);
                        ret.push("','");
                        ret.push(listItem.ID);
                        ret.push("');return false;\" target=\"_self\">");
                        ret.push('<img border="0" align="absmiddle" style="cursor: hand" src="' + ListView.ImageBasePath + '/_layouts/15/images/rbunsel.gif' + '"  alt="');
                        ret.push(GetString("L_SPGroupBoardTimeCardSettingsNotFlex"));
                        ret.push('" /></a>');
                        return ret.join('');
                    }
                },
                DisplayResponse: function(renderCtx, field, listItem, listSchema) {
                    var ret = [];

                    ret.push('<a onfocus="OnLink(this)" href="');
                    ret.push(renderCtx.displayFormUrl);
                    ret.push('&ID=');
                    ret.push(listItem.ID);
                    ret.push('" onclick="GoToLinkOrDialogNewWindow(this);return false;" target="_self" id="onetidViewResponse">');
                    ret.push(GetString("L_SPView_Response"));
                    ret.push(' #');
                    ret.push(listItem.ID);
                    ret.push('</a>');
                    return ret.join('');
                },
                Completed: function(renderCtx, field, listItem, listSchema) {
                    if (listItem["_Level"] == '1')
                        return GetString("L_SPYes");
                    else
                        return GetString("L_SPNo");
                },
                RepairDocument: function(renderCtx, field, listItem, listSchema) {
                    return '<input id="chkRepair" type="checkbox" title="' + GetString("L_SPRelink") + '" docID="' + listItem.ID + '" />';
                },
                Combine: function(renderCtx, field, listItem, listSchema) {
                    if (listItem.FSObjType == '0') {
                        var ret = '<input id="chkCombine" type="checkbox" title="';

                        ret += GetString("L_SPMerge");
                        ret += '" href="';
                        var url;

                        if (listItem.FSObjType == '0')
                            url = String(listSchema.HttpVDir) + String(listItem.FileRef);
                        else
                            url = listItem.FileRef;
                        ret += url + '" />';
                        ret += '<input id="chkUrl" type="hidden" href="';
                        ret += listItem.TemplateUrl;
                        ret += '" />';
                        ret += '<input id="chkProgID" type="hidden" href="';
                        ret += listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"];
                        ret += '" />';
                        return ret;
                    }
                    return '';
                },
                HealthReportSeverityIcon: function(renderCtx, field, listItem, listSchema) {
                    var healthSeverity = new String(listItem.HealthReportSeverity);
                    var index = healthSeverity.indexOf(" - ");

                    healthSeverity = healthSeverity.substring(0, index);
                    var pngUrl;

                    if (healthSeverity == '1')
                        pngUrl = 'hltherr';
                    else if (healthSeverity == '2')
                        pngUrl = 'hlthwrn';
                    else if (healthSeverity == '3')
                        pngUrl = 'hlthinfo';
                    else if (healthSeverity == '4')
                        pngUrl = 'hlthsucc';
                    else
                        pngUrl = 'hlthfail';
                    return '<img src="' + ListView.ImageBasePath + '/_layouts/15/images/' + pngUrl + '.png" alt="' + healthSeverity + '" />';
                },
                FileSizeDisplay: function(renderCtx, field, listItem, listSchema) {
                    var ret = [];

                    if (listItem.FSObjType == '0')
                        return String(Math.ceil(listItem.File_x0020_Size / 1024)) + ' KB';
                    else
                        return '';
                },
                NameOrTitle: function(renderCtx, field, listItem, listSchema) {
                    return RenderLinkToItem(renderCtx, listItem, listSchema, listItem["FileLeafRef"]);
                },
                ImageSize: function(renderCtx, field, listItem, listSchema) {
                    var ret = [];

                    if (listItem.FSObjType == '0') {
                        if (listItem["ImageWidth"] != '' && listItem["ImageWidth"] != '0') {
                            ret.push('<span dir="ltr">');
                            ret.push(listItem["ImageWidth"] + ' x ' + listItem["ImageHeight"]);
                            ret.push('</span>');
                        }
                    }
                    return ret.join('');
                },
                ThumbnailOnForm: RenderThumbnail,
                PreviewOnForm: RenderThumbnail,
                Thumbnail: RenderThumbnail,
                FileType: function(renderCtx, field, listItem, listSchema) {
                    return listItem["File_x0020_Type"];
                }
            };
        })();

        function ComputedFieldRenderer_InitializePrototype() {
            ComputedFieldRenderer.prototype = {
                fieldRenderer: null,
                fldName: null,
                RenderField: ComputedFieldRenderField
            };
        }
        ComputedFieldRenderer_InitializePrototype();
        function ComputedFieldRenderer(fieldName) {
            this.fldName = fieldName;
            this.fieldRenderer = null;
        }
        function ComputedFieldRenderField(renderCtx, field, listItem, listSchema) {
            if (this.fieldRenderer == null)
                this.fieldRenderer = ComputedFieldWorker[this.fldName];
            if (this.fieldRenderer != null)
                return this.fieldRenderer(renderCtx, field, listItem, listSchema);
            else
                return Encoding.HtmlEncode(listItem[this.fldName]);
        }
        var RenderCalloutAffordance = function(fSelectItem, listItem, strCalloutLaunchPointID, fIsForTileView) {
            var ret = [];
            var isForTileView = Boolean(fIsForTileView);
            var anchorClassName = "ms-lstItmLinkAnchor " + (isForTileView ? "ms-ellipsis-a-tile" : "ms-ellipsis-a");

            ret.push("<a ms-jsgrid-click-passthrough=\"true\" class=\"" + anchorClassName + "\" title=\"");
            ret.push(Encoding.HtmlEncode(GetString("L_OpenMenu")));
            ret.push("\"");
            ret.push("onclick=\"");
            if (!fIsForTileView) {
                AddUIInstrumentationClickEvent(ret, listItem, 'Hover');
            }
            if (fSelectItem) {
                ret.push("OpenCalloutAndSelectItem(this, event, this, '" + listItem.ID + "'); return false;\" href=\"#\" id=\"" + strCalloutLaunchPointID + "\" >");
            }
            else {
                ret.push("OpenCallout(this, event, this, '" + listItem.ID + "'); return false;\" href=\"#\" id=\"" + strCalloutLaunchPointID + "\" >");
            }
            var imageClassName = isForTileView ? "ms-ellipsis-icon-tile" : "ms-ellipsis-icon";

            ret.push("<img class=\"" + imageClassName + "\" src=\"" + GetThemedImageUrl("spcommon.png") + "\" alt=\"" + Encoding.HtmlEncode(GetString("L_OpenMenu")) + "\" /></a>");
            return ret.join('');
        };
        var RenderECB = function(renderCtx, listItem, field, content, fMakeNewColumn) {
            var ret = [];
            var listSchema = renderCtx.ListSchema;

            ret.push("<div class=\"ms-vb " + (fMakeNewColumn == true ? "" : "ms-tableCell ms-list-TitleLink") + " ms-vb-menuPadding itx\" CTXName=\"ctx");
            ret.push(renderCtx.ctxId);
            ret.push("\" id=\"");
            ret.push(listItem.ID);
            ret.push("\" Field=\"");
            ret.push(field.Name);
            ret.push("\" Perm=\"");
            ret.push(listItem.PermMask);
            ret.push("\" EventType=\"");
            ret.push(listItem.EventType);
            ret.push("\">");
            ret.push(content);
            ret.push("</div>");
            if (fMakeNewColumn == true) {
                ret.push("</td><td class=\"ms-list-itemLink-td ms-cellstyle");
                if (listSchema.Field[listSchema.Field.length - 1] == field)
                    ret.push(" ms-vb-lastCell");
                ret.push("\" >");
            }
            ret.push("<div class=\"ms-list-itemLink " + (fMakeNewColumn == true ? "" : "ms-tableCell ms-alignRight") + "\" ");
            ret.push("onclick=\"CoreInvoke('ShowECBMenuForTr', this, event");
            ret.push(", ListView.Strings");
            ret.push("); return false;\">");
            ret.push("<a ms-jsgrid-click-passthrough=\"true\" class=\"ms-lstItmLinkAnchor ms-ellipsis-a\" title=\"");
            ret.push(Encoding.HtmlEncode(GetString("L_OpenMenu")));
            ret.push("\"");
            ret.push("onclick=\"CoreInvoke('ShowECBMenuForTr', this.parentNode, event");
            ret.push(", ListView.Strings");
            ret.push("); return false; \" href=\"#\" >");
            ret.push("<img class=\"ms-ellipsis-icon\" src=\"" + GetThemedImageUrl("spcommon.png") + "\" alt=\"" + Encoding.HtmlEncode(GetString("L_OpenMenu")) + "\" /></a>");
            ret.push("</div>");
            return ret.join('');
        };
        var RenderECBinline = function(renderCtx, listItem, field) {
            var ret = [];

            ret.push("<span class=\"js-callout-ecbMenu\" CTXName=\"ctx");
            ret.push(renderCtx.ctxId);
            ret.push("\" id=\"");
            ret.push(listItem.ID);
            ret.push("\" Field=\"");
            ret.push(field.Name);
            ret.push("\" Perm=\"");
            ret.push(listItem.PermMask);
            ret.push("\" EventType=\"");
            ret.push(listItem.EventType);
            ret.push("\">");
            ret.push("<a class=\"js-callout-action ms-calloutLinkEnabled ms-calloutLink js-ellipsis25-a\" onclick=\"calloutCreateAjaxMenu(event); return false;\" href=\"#\" title=\"" + GetString("L_OpenMenu_Text") + "\">");
            ret.push("<img class=\"js-ellipsis25-icon\" src=\"" + GetThemedImageUrl("spcommon.png") + "\" alt=\"" + Encoding.HtmlEncode(GetString("L_OpenMenu")) + "\" />");
            ret.push("</a>");
            ret.push("</span>");
            return ret.join('');
        };

        function calloutCreateAjaxMenu(e) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "Callouts not supported (yet) in standalone list view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        ;
        var g_lastLaunchPointIIDClicked = null;

        function OpenCallout(launchPoint, curEvent, node, listItemID) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "Callouts not supported (yet) in standalone list view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        var RenderCalloutMenu = function(renderCtx, listItem, field, content, fMakeNewColumn) {
            var ret = [];
            var calloutLaunchPointID = "ctx" + renderCtx.ctxId + "_" + listItem.ID + "_calloutLaunchPoint";
            var listSchema = renderCtx.ListSchema;

            ret.push("<div class=\"ms-vb " + (fMakeNewColumn == true ? "" : "ms-tableCell ms-list-TitleLink") + " itx\" CTXName=\"ctx");
            ret.push(renderCtx.ctxId);
            ret.push("\" id=\"");
            ret.push(listItem.ID);
            ret.push("\" App=\"");
            ret.push(listItem["File_x0020_Type.mapapp"]);
            ret.push("\">");
            ret.push(content);
            ret.push("</div>");
            if (fMakeNewColumn == true) {
                ret.push("</td><td class=\"ms-list-itemLink-td ms-cellstyle");
                if (listSchema.Field[listSchema.Field.length - 1] == field)
                    ret.push(" ms-vb-lastCell");
                ret.push("\" >");
            }
            if (typeof listItem.RenderCalloutWithoutHover != 'undefined' && listItem.RenderCalloutWithoutHover) {
                ret.push(RenderCalloutAffordance(false, listItem, calloutLaunchPointID, true));
            }
            else {
                ret.push("<div class=\"ms-list-itemLink " + (fMakeNewColumn == true ? "" : "ms-tableCell ms-alignRight") + " \" ");
                ret.push(" onclick=\"ShowMenuForTrOuter(this,event, true); return false;\" >");
                ret.push(RenderCalloutAffordance(true, listItem, calloutLaunchPointID, false));
                ret.push("</div>");
            }
            return ret.join('');
        };

        function findIIDInAncestorNode(node) {
            while (node !== null && node.tagName !== "TABLE") {
                var nodeiid = node.getAttribute('iid');

                if (nodeiid !== null && nodeiid !== "")
                    return nodeiid;
                else
                    node = node.parentNode;
            }
            return null;
        }
        var usedCalloutIDs = {};
        var generateUniqueCalloutIDFromBaseID = function(baseID) {
            if (typeof usedCalloutIDs[baseID] !== 'number') {
                usedCalloutIDs[baseID] = 0;
                return baseID;
            }
            else {
                ++usedCalloutIDs[baseID];
                return baseID + "_" + String(usedCalloutIDs[baseID]);
            }
        };
        var g_ClipboardControl = null;
        var g_IsClipboardControlValid = false;

        function EnsureClipboardControl() {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "Clipboard control not (yet) supported in standalone list view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            return false;
        }
        function GetClientAppNameFromMapApp(mapApp) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "Client app names not (yet) supported in standalone list view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            return null;
        }
        function CopyToClipboard(textToCopy, htmlToCopy) {
            if (EnsureClipboardControl()) {
                g_ClipboardControl.CopyToClipboard(textToCopy, htmlToCopy);
            }
        }
        function isPositiveInteger(s) {
            var pattern = /^[1-9][0-9]*$/;

            return pattern.test(s);
        }
        function createOneTimeCallback(fn) {
            return (function() {
                var hasLoadedOnce = false;

                return function() {
                    if (hasLoadedOnce)
                        return;
                    hasLoadedOnce = true;
                    return fn.apply(this, arguments);
                };
            })();
        }
        ;
        function EnableSharingDialogIfNeeded(renderCtx) {
        }
        function isDefinedAndNotNullOrEmpty(obj) {
            return typeof obj !== 'undefined' && obj !== null && obj !== '';
        }
        function EnsureFileLeafRefName(listItem) {
            if (typeof listItem["FileLeafRef.Name"] == 'undefined') {
                var fileLeafRef = listItem["FileLeafRef"];
                var suffixIndex = fileLeafRef.lastIndexOf('.');

                if (suffixIndex >= 0)
                    listItem["FileLeafRef.Name"] = fileLeafRef.substring(0, suffixIndex);
                else
                    listItem["FileLeafRef.Name"] = fileLeafRef;
            }
        }
        function EnsureFileLeafRefSuffix(listItem) {
            if (typeof listItem["FileLeafRef.Suffix"] == 'undefined') {
                var fileLeafRef = listItem["FileLeafRef"];
                var suffixIndex = fileLeafRef.lastIndexOf('.');

                if (suffixIndex >= 0)
                    listItem["FileLeafRef.Suffix"] = fileLeafRef.substring(suffixIndex + 1);
                else
                    listItem["FileLeafRef.Suffix"] = '';
            }
        }
        function EnsureFileDirRef(listItem) {
            if (typeof listItem["FileDirRef"] == 'undefined') {
                var fileRef = listItem["FileRef"];
                var prefixIndex = fileRef.indexOf('/');
                var suffixIndex = fileRef.lastIndexOf('/');

                if (suffixIndex >= 0)
                    listItem["FileDirRef"] = fileRef.substring(prefixIndex, suffixIndex - prefixIndex);
                else
                    listItem["FileDirRef"] = '';
            }
        }
        var getDocumentIconAbsoluteUrl = function(listItem, size, renderCtx) {
            var isFolder = listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapico"] == '';
            var sizeStr;

            if (typeof size === "undefined" || size === 16)
                sizeStr = "";
            else if (isFolder)
                sizeStr = String(size);
            else if (size === 32)
                sizeStr = "lg_";
            else
                sizeStr = String(size) + "_";
            EnsureFileLeafRefName(listItem);
            EnsureFileLeafRefSuffix(listItem);
            EnsureFileDirRef(listItem);
            var alternateThumbnailUrl = listItem["AlternateThumbnailUrl"];
            var hasAlternateThumbnailUrl = isDefinedAndNotNullOrEmpty(alternateThumbnailUrl);
            var fileExtension = listItem["FileLeafRef.Suffix"];
            var previewExists = listItem["PreviewExists.value"] == "1" && isDefinedAndNotNullOrEmpty(listItem["FileLeafRef.Name"]) && isDefinedAndNotNullOrEmpty(fileExtension) || listItem["PreviewExists.value"] == "" && renderCtx != null && renderCtx.ListTemplateType == 109;
            var isAudioFile = isDefinedAndNotNullOrEmpty(fileExtension) && (fileExtension == "mp3" || fileExtension == "wma" || fileExtension == "wav" || fileExtension == "oga");
            var ctx = renderCtx;

            if (sizeStr != '' && (hasAlternateThumbnailUrl || previewExists)) {
                if (hasAlternateThumbnailUrl) {
                    return String(alternateThumbnailUrl);
                }
                else {
                    return listItem["FileDirRef"] + "/_w/" + listItem["FileLeafRef.Name"] + "_" + listItem["FileLeafRef.Suffix"] + ".jpg";
                }
            }
            else if (isAudioFile)
                return ctx.imagesPath + "audiopreview.png";
            else if (isFolder)
                return ctx.imagesPath + "folder" + sizeStr + ".gif";
            else
                return ctx.imagesPath + sizeStr + listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapico"];
        };

        function EncodeUrl(str) {
            if (typeof str != 'undefined' && str != null)
                return str.replace(/"/g, '%22');
            else
                return "";
        }
        function RenderUrl(listItem, fldName, listSchema, field, onfocusParam) {
            var ret = [];
            var url = listItem[fldName];
            var dest = listItem[fldName + ".desc"];

            if (field.Format == 'Image') {
                if (isDefinedAndNotNullOrEmpty(url)) {
                    ret.push("<img ");
                    if (onfocusParam)
                        ret.push("onfocus=\"OnLink(this)\" ");
                    ret.push("src=\"");
                    ret.push(EncodeUrl(url));
                    ret.push("\" alt=\"");
                    ret.push(dest);
                    ret.push("\"/>");
                }
            }
            else if (field.Format == 'Hyperlink') {
                if (!isDefinedAndNotNullOrEmpty(url)) {
                    if (dest != null)
                        ret.push(dest);
                }
                else {
                    ret.push("<a ");
                    if (onfocusParam)
                        ret.push("onfocus=\"OnLink(this)\" ");
                    ret.push("href=\"");
                    ret.push(EncodeUrl(url));
                    if (Boolean(window.location.search.match(RegExp("[?&]IsDlg=1")))) {
                        ret.push("\" target=\"_blank");
                    }
                    ret.push("\">");
                    if (dest == '')
                        ret.push(Encoding.HtmlEncode(url));
                    else
                        ret.push(Encoding.HtmlEncode(dest));
                    ret.push("</a>");
                }
            }
            return ret.join('');
        }
        function ResolveId(listItem, listSchema) {
            if (listItem.EventType == '4')
                return listItem.ID + ".1." + listItem.MasterSeriesItemID;
            else
                return listItem.ID;
        }
        function EditRequiresCheckout(listItem, listSchema) {
            if (listSchema.ForceCheckout == '1' && listItem.FSObjType != '1' && !(typeof listItem["CheckoutUser"] == 'undefined' || listItem["CheckoutUser"] == ''))
                return '1';
            else
                return '';
        }
        function fMaintainUserChrome() {
            var maintain = false;

            return maintain;
        }
        function UpdateAdditionalQueryString(listItem, queryParameter, newValue) {
            var additionalQueryString = listItem["AdditionalQueryString"];

            if (typeof additionalQueryString == 'undefined' || additionalQueryString == '') {
                listItem["AdditionalQueryString"] = "&" + queryParameter + "=" + newValue;
                return;
            }
            else {
                var uri = new URI(listItem["FileRef"] + "?" + additionalQueryString);

                uri.setQueryParameter(queryParameter, newValue);
                listItem["AdditionalQueryString"] = "&" + uri.getQuery();
            }
        }
        function AppendAdditionalQueryStringToFolderUrl(listItem, ret) {
            var additionalQueryString = listItem["AdditionalQueryString"];

            if (typeof additionalQueryString == 'undefined' || additionalQueryString == '')
                return;
            ret.push(additionalQueryString);
        }
        function FolderUrl(listItem, listSchema, ret) {
            ret.push(listSchema.PagePath);
            ret.push("?RootFolder=");
            ret.push(URI_Encoding.encodeURIComponent(listItem.FileRef));
            ret.push(listSchema.ShowWebPart);
            ret.push("&FolderCTID=");
            ret.push(listItem.ContentTypeId);
            ret.push("&View=");
            ret.push(URI_Encoding.encodeURIComponent(listSchema.View));
            AppendAdditionalQueryStringToFolderUrl(listItem, ret);
        }
        function RenderListFolderLink(ret, content, listItem, listSchema) {
            ret.push("<a onfocus=\"OnLink(this)\" href=\"");
            FolderUrl(listItem, listSchema, ret);
            ret.push("\" onclick=\"");
            AddUIInstrumentationClickEvent(ret, listItem, 'Navigation');
            ret.push("javascript:EnterFolder('");
            ret.push(listSchema.PagePath);
            ret.push("?RootFolder=");
            ret.push(URI_Encoding.encodeURIComponent(listItem.FileRef));
            ret.push(listSchema.ShowWebPart);
            ret.push("&FolderCTID=");
            ret.push(listItem.ContentTypeId);
            ret.push("&View=");
            ret.push(URI_Encoding.encodeURIComponent(listSchema.View));
            AppendAdditionalQueryStringToFolderUrl(listItem, ret);
            ret.push("');return false;\">");
            ret.push(Encoding.HtmlEncode(content));
            ret.push("</a>");
        }
        function RenderDocFolderLink(ret, content, listItem, listSchema) {
            if (fMaintainUserChrome())
                UpdateAdditionalQueryString(listItem, "MaintainUserChrome", "true");
            ret.push("<a onfocus=\"OnLink(this)\" class=\"ms-listlink\" href=\"");
            FolderUrl(listItem, listSchema, ret);
            ret.push("\" onmousedown=\"");
            ret.push("javascript:VerifyFolderHref(this,event,'");
            ret.push(listItem["File_x0020_Type.url"]);
            ret.push("','");
            ret.push(listItem["File_x0020_Type.progid"]);
            ret.push("','");
            ret.push(listSchema.DefaultItemOpen);
            ret.push("','");
            ret.push(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"]);
            ret.push("','");
            ret.push(listItem["HTML_x0020_File_x0020_Type"]);
            ret.push("','");
            ret.push(listItem["serverurl.progid"]);
            ret.push("');return false;\" onclick=\"");
            AddUIInstrumentationClickEvent(ret, listItem, 'Navigation');
            ret.push("return HandleFolder(this,event,'");
            ret.push(listSchema.PagePath);
            ret.push("?RootFolder=");
            ret.push(URI_Encoding.encodeURIComponent(listItem.FileRef));
            ret.push(listSchema.ShowWebPart);
            ret.push("&FolderCTID=");
            ret.push(listItem.ContentTypeId);
            ret.push("&View=");
            ret.push(URI_Encoding.encodeURIComponent(listSchema.View));
            AppendAdditionalQueryStringToFolderUrl(listItem, ret);
            ret.push("','TRUE','FALSE','");
            ret.push(listItem["File_x0020_Type.url"]);
            ret.push("','");
            ret.push(listItem["File_x0020_Type.progid"]);
            ret.push("','");
            ret.push(listSchema.DefaultItemOpen);
            ret.push("','");
            ret.push(listItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon"]);
            ret.push("','");
            ret.push(listItem["HTML_x0020_File_x0020_Type"]);
            ret.push("','");
            ret.push(listItem["serverurl.progid"]);
            ret.push("','");
            ret.push(Boolean(listItem["CheckoutUser"]) ? listItem["CheckoutUser"][0].id : '');
            ret.push("','");
            ret.push(listSchema.Userid);
            ret.push("','");
            ret.push(listSchema.ForceCheckout);
            ret.push("','");
            ret.push(listItem.IsCheckedoutToLocal);
            ret.push("','");
            ret.push(listItem.PermMask);
            ret.push("');\">");
            ret.push(Encoding.HtmlEncode(content));
            ret.push("</a>");
        }
        function FieldRenderer_InitializePrototype() {
            FieldRenderer.prototype = {
                fldName: null,
                RenderField: FieldRendererRenderField
            };
        }
        FieldRenderer_InitializePrototype();
        function FieldRenderer(fieldName) {
            this.fldName = fieldName;
        }
        function FieldRendererRenderField(renderCtx, field, listItem, listSchema) {
            return Encoding.HtmlEncode(listItem[this.fldName]);
        }
        function RawFieldRenderer_InitializePrototype() {
            RawFieldRenderer.prototype = {
                fldName: null,
                RenderField: RawFieldRendererRenderField
            };
        }
        RawFieldRenderer_InitializePrototype();
        function RawFieldRenderer(fieldName) {
            this.fldName = fieldName;
        }
        function RawFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
            return listItem[this.fldName];
        }
        function AttachmentFieldRenderer_InitializePrototype() {
            AttachmentFieldRenderer.prototype = {
                fldName: null,
                RenderField: AttachmentFieldRendererRenderField
            };
        }
        AttachmentFieldRenderer_InitializePrototype();
        function AttachmentFieldRenderer(fieldName) {
            this.fldName = fieldName;
        }
        function AttachmentFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
            var value = listItem[this.fldName];

            if (value != '0')
                return "<img border=\"0\" width=\"16\" height=\"16\" src=\"" + GetThemedImageUrl("attach16.png") + "\"/>";
            else
                return "";
        }
        function RecurrenceFieldRenderer_InitializePrototype() {
            RecurrenceFieldRenderer.prototype = {
                fldName: null,
                RenderField: RecurrenceFieldRendererRenderField
            };
        }
        RecurrenceFieldRenderer_InitializePrototype();
        function RecurrenceFieldRenderer(fieldName) {
            this.fldName = fieldName;
        }
        function RecurrenceFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "Recurrence fields not (yet) supported in standalone list view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            return '';
        }
        function ProjectLinkFieldRenderer_InitializePrototype() {
            ProjectLinkFieldRenderer.prototype = {
                fldName: null,
                RenderField: ProjectLinkFieldRendererRenderField
            };
        }
        ProjectLinkFieldRenderer_InitializePrototype();
        function ProjectLinkFieldRenderer(fieldName) {
            this.fldName = fieldName;
        }
        function ProjectLinkFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
            if (!(listItem.WorkspaceLink == '1' || listItem.WorkspaceLink == '-1')) {
                return '<img border="0" width="16" height="16" src="' + ListView.ImageBasePath + '/_layouts/15/images/blank.gif' + '" />';
            }
            else {
                var ret = '<a href="';

                ret += listItem.Workspace;
                ret += '" target="_self" title="';
                ret += GetString("L_SPMeetingWorkSpace");
                ret += '"><img border="" src="' + GetThemedImageUrl("mtgicon.gif") + '" alt="';
                ret += GetString("L_SPMeetingWorkSpace");
                ret += '"/></a>';
                return ret;
            }
        }
        function AllDayEventFieldRenderer_InitializePrototype() {
            AllDayEventFieldRenderer.prototype = {
                fldName: null,
                RenderField: AllDayEventFieldRendererRenderField
            };
        }
        AllDayEventFieldRenderer_InitializePrototype();
        function AllDayEventFieldRenderer(fieldName) {
            this.fldName = fieldName;
        }
        function AllDayEventFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
            if (listItem[this.fldName] == GetString("L_SPYes"))
                return GetString("L_SPYes");
            else
                return '';
        }
        function NumberFieldRenderer_InitializePrototype() {
            NumberFieldRenderer.prototype = {
                fldName: null,
                RenderField: NumberFieldRendererRenderField
            };
        }
        NumberFieldRenderer_InitializePrototype();
        function NumberFieldRenderer(fieldName) {
            this.fldName = fieldName;
        }
        function NumberFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
            return '<div align="right" class="ms-number">' + listItem[this.fldName] + '</div>';
        }
        function BusinessDataFieldRenderer_InitializePrototype() {
            BusinessDataFieldRenderer.prototype = {
                fldName: null,
                RenderField: BusinessDataFieldRendererRenderField
            };
        }
        BusinessDataFieldRenderer_InitializePrototype();
        function BusinessDataFieldRenderer(fieldName) {
            this.fldName = fieldName;
        }
        function BusinessDataFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
            var fieldDefinition = renderCtx['CurrentFieldSchema'];
            var fieldValue = listItem[this.fldName];

            if (fieldValue == '') {
                fieldValue = GetString("L_BusinessDataField_Blank");
            }
            var ret = '<table cellpadding="0" cellspacing="0" style="display=inline">';

            ret += '<tr>';
            if (Boolean(fieldDefinition.HasActions)) {
                ret += '<td><input type="hidden" name="BusinessDataField_ActionsMenuProxyPageWebUrl" id="BusinessDataField_ActionsMenuProxyPageWebUrl" value="' + renderCtx.HttpRoot + '" />';
                ret += '<div style="display=inline">';
                ret += '<table cellspacing="0">';
                ret += '<tr>';
                ret += '<td class="ms-vb" valign="top" nowrap="nowrap">';
                ret += '<span class="ms-SPLink ms-hovercellinactive" onmouseover="this.className=\'ms-SPLink ms-HoverCellActive\';" onmouseout="this.className=\'ms-SPLink ms-HoverCellInactive\';">';
                var onclickMethod = '';
                var onKeyDownMethod = '';
                var methodParameters = '';

                if (Boolean(renderCtx.ExternalDataList)) {
                    methodParameters = '\'' + GetString("L_BusinessDataField_ActionMenuLoadingMessage") + '\',null,true,\'' + renderCtx.LobSystemInstanceName + '\',\'' + renderCtx.EntityNamespace + '\',\'' + renderCtx.EntityName + '\',\'' + renderCtx.SpecificFinderName + '\',\'' + fieldDefinition.AssociationName + '\',\'' + fieldDefinition.SystemInstanceName + '\',\'' + fieldDefinition.EntityNamespace + '\',\'' + fieldDefinition.EntityName + '\',\'' + listItem.ID + '\', event';
                    onclickMethod = 'showActionMenuInExternalList(' + methodParameters + ')';
                    onKeyDownMethod = 'actionMenuOnKeyDownInExternalList(' + methodParameters + ')';
                }
                else {
                    if (typeof field.RelatedField != 'undefined' && field.RelatedField != '' && typeof listItem[field.RelatedField] != 'undefined' && listItem[field.RelatedField] != '') {
                        methodParameters = '\'' + GetString("L_BusinessDataField_ActionMenuLoadingMessage") + '\',null,true,\'' + fieldDefinition.SystemInstanceName + '\',\'' + fieldDefinition.EntityNamespace + '\',\'' + fieldDefinition.EntityName + '\',\'' + listItem[field.RelatedField] + '\', event';
                        onclickMethod = 'showActionMenu(' + methodParameters + ')';
                        onKeyDownMethod = 'actionMenuOnKeyDown(' + methodParameters + ')';
                    }
                }
                ret += '<a style="cursor:hand;white-space:nowrap;">';
                ret += '<img border="0" align="absmiddle" src=' + ListView.ImageBasePath + "/_layouts/15/images/bizdataactionicon.gif?rev=33" + ' tabindex="0" alt="' + GetString("L_BusinessDataField_ActionMenuAltText") + '" title="' + GetString("L_BusinessDataField_ActionMenuAltText") + '"';
                ret += ' onclick="' + onclickMethod + '"';
                ret += ' onkeydown="' + onKeyDownMethod + '" />';
                ret += '</a>';
                ret += '<a>';
                ret += '<img align="absmiddle" src=' + ListView.ImageBasePath + "/_layouts/15/images/menudark.gif?rev=33" + ' tabindex="0" alt="' + GetString("L_BusinessDataField_ActionMenuAltText") + '"';
                ret += ' onclick="' + onclickMethod + '"';
                ret += ' onkeydown="' + onKeyDownMethod + '" />';
                ret += '</a>';
                ret += '</span>';
                ret += '</td>';
                ret += '</tr>';
                ret += '</table>';
                ret += '</div>';
                ret += '<div STYLE="display=inline" />';
                ret += '</td>';
            }
            ret += '<td class="ms-vb">';
            if (fieldDefinition.Profile != '' && fieldDefinition.ContainsDefaultAction == 'True') {
                ret += '<a href="' + renderCtx.HttpRoot + fieldDefinition.Profile + listItem[field.RelatedField] + '" >' + fieldValue + '</a>';
            }
            else {
                ret += fieldValue;
            }
            ret += '</td>';
            ret += '</tr>';
            ret += '</table>';
            return ret;
        }
        function DateTimeFieldRenderer_InitializePrototype() {
            DateTimeFieldRenderer.prototype = {
                fldName: null,
                RenderField: DateTimeFieldRendererRenderField
            };
        }
        DateTimeFieldRenderer_InitializePrototype();
        function DateTimeFieldRenderer(fieldName) {
            this.fldName = fieldName;
        }
        function DateTimeFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
            var absoluteDateTimeString = listItem[this.fldName];

            if (absoluteDateTimeString == null) {
                return "";
            }
            var friendlyDisplayText = listItem[this.fldName + ".FriendlyDisplay"];
            var relativeDateTimeString = null;

            if (friendlyDisplayText != null && friendlyDisplayText != "") {
                relativeDateTimeString = GetRelativeDateTimeString(friendlyDisplayText);
            }
            var ret = '<span class="ms-noWrap" title="' + absoluteDateTimeString + '">';

            ret += relativeDateTimeString != null && relativeDateTimeString != "" ? relativeDateTimeString : absoluteDateTimeString;
            ret += '</span>';
            return ret;
        }
        function TextFieldRenderer_InitializePrototype() {
            TextFieldRenderer.prototype = {
                fldName: null,
                RenderField: TextFieldRendererRenderField
            };
        }
        TextFieldRenderer_InitializePrototype();
        function TextFieldRenderer(fieldName) {
            this.fldName = fieldName;
        }
        function TextFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
            if (field.AutoHyperLink != null)
                return listItem[this.fldName];
            else
                return Encoding.HtmlEncode(listItem[this.fldName]);
        }
        function LookupFieldRenderer_InitializePrototype() {
            LookupFieldRenderer.prototype = {
                fldName: null,
                RenderField: LookupFieldRendererRenderField
            };
        }
        LookupFieldRenderer_InitializePrototype();
        function LookupFieldRenderer(fieldName) {
            this.fldName = fieldName;
        }
        function LookupFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
            function GetFieldValueAsText(value) {
                if (!Boolean(value))
                    return '';
                ret = [];
                for (i = 0; i < value.length; i++) {
                    if (i > 0)
                        ret.push("; ");
                    ret.push(Encoding.HtmlEncode(value[i].lookupValue));
                }
                return ret.join('');
            }
            var fieldValue = listItem[this.fldName];

            if (!Boolean(fieldValue))
                return '';
            if (typeof fieldValue == "string")
                return Encoding.HtmlEncode(fieldValue);
            if (field.RenderAsText != null)
                return GetFieldValueAsText(fieldValue);
            if (!Boolean(field.DispFormUrl))
                return '';
            var ret = [];

            for (var i = 0; i < fieldValue.length; i++) {
                if (i > 0)
                    ret.push("; ");
                var sbUrl = [];

                sbUrl.push(field.DispFormUrl);
                sbUrl.push("&ID=");
                sbUrl.push(fieldValue[i].lookupId.toString());
                sbUrl.push("&RootFolder=*");
                var url = sbUrl.join('');

                ret.push("<a ");
                ret.push("onclick=\"OpenPopUpPage('");
                ret.push(url);
                ret.push("', RefreshPage); return false;\" ");
                ret.push("href=\"");
                ret.push(url);
                ret.push("\">");
                ret.push(Encoding.HtmlEncode(fieldValue[i].lookupValue));
                ret.push("</a>");
            }
            return ret.join('');
        }
        function NoteFieldRenderer_InitializePrototype() {
            NoteFieldRenderer.prototype = {
                fldName: null,
                RenderField: NoteFieldRendererRenderField
            };
        }
        NoteFieldRenderer_InitializePrototype();
        function NoteFieldRenderer(fieldName) {
            this.fldName = fieldName;
        }
        function NoteFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
            var ret = [];

            ret.push("<div dir=\"");
            ret.push(field.Direction);
            ret.push("\" class=\"ms-rtestate-field\">");
            ret.push(listItem[this.fldName]);
            ret.push("</div>");
            return ret.join('');
        }
        function UrlFieldRenderer_InitializePrototype() {
            UrlFieldRenderer.prototype = {
                fldName: null,
                RenderField: UrlFieldRendererRenderField
            };
        }
        UrlFieldRenderer_InitializePrototype();
        function UrlFieldRenderer(fieldName) {
            this.fldName = fieldName;
        }
        function UrlFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
            return RenderUrl(listItem, this.fldName, listSchema, field, false);
        }
        function UserFieldRenderer_InitializePrototype() {
            UserFieldRenderer.prototype = {
                fldName: null,
                RenderField: UserFieldRendererRenderField
            };
        }
        UserFieldRenderer_InitializePrototype();
        function UserFieldRenderer(fieldName) {
            this.fldName = fieldName;
        }
        function SetFieldClickInstrumentationData(userField, listItem) {
            if (typeof listItem.piCD != "undefined" && listItem.piCD != "") {
                if (typeof userField.piCD == "undefined") {
                    userField.piCD = listItem.piCD;
                }
            }
            if (typeof listItem.piPC != "undefined" && listItem.piPC != "") {
                if (typeof userField.piPC == "undefined") {
                    userField.piPC = listItem.piPC;
                }
            }
        }
        var s_ImnId = 1;

        function UserFieldRendererRenderField(renderCtx, field, listItem, listSchema) {
            var userField = listItem[this.fldName];

            if (typeof userField == "string" && (userField == '' || userField == "***")) {
                return userField;
            }
            var ret = [];
            var defaultMultiUserRender = field.DefaultRender && field.AllowMultipleValues;
            var inlineMultiUserRender = defaultMultiUserRender && field.InlineRender;

            if (inlineMultiUserRender) {
                var renderedUsersHtml = [];

                for (var userIndex = 0; userIndex < userField.length; userIndex++) {
                    var userFieldItem = userField[userIndex];

                    SetFieldClickInstrumentationData(userFieldItem, listItem);
                    renderedUsersHtml.push(RenderUserFieldWorker(renderCtx, field, userFieldItem, listSchema));
                }
                if (renderedUsersHtml.length === 1)
                    ret.push(renderedUsersHtml[0]);
                else if (renderedUsersHtml.length === 2)
                    ret.push(StringUtil.BuildParam(Encoding.HtmlEncode(GetString("L_UserFieldInlineTwo")), renderedUsersHtml[0], renderedUsersHtml[1]));
                else if (renderedUsersHtml.length === 3)
                    ret.push(StringUtil.BuildParam(Encoding.HtmlEncode(GetString("L_UserFieldInlineThree")), renderedUsersHtml[0], renderedUsersHtml[1], renderedUsersHtml[2]));
                else {
                    var moreLinkOpenTagHtml = '';
                    var moreLinkCloseTagHtml = '';

                    if (Boolean(field.InlineRenderMoreAsLink)) {
                        moreLinkOpenTagHtml = '<a href="#" onclick="return false;" class="ms-imnMoreLink ms-link">';
                        moreLinkCloseTagHtml = '</a>';
                    }
                    var numMore = renderedUsersHtml.length - 3;

                    (function() {
                        if (!(numMore > 0)) {
                            if (confirm("Assertion failed: " + 'Error rendering user list' + ". Break into debugger?"))
                                eval("debugger");
                        }
                    })();
                    ;
                    ret.push(StringUtil.BuildParam(Encoding.HtmlEncode(GetString("L_UserFieldInlineMore")), renderedUsersHtml[0], renderedUsersHtml[1], renderedUsersHtml[2], moreLinkOpenTagHtml, String(numMore), moreLinkCloseTagHtml));
                }
            }
            else {
                if (defaultMultiUserRender)
                    ret.push("<table style='padding:0px; border-spacing:0px; border:none'><tr><td class='ms-vb'>");
                var bFirst = true;

                for (var idx in userField) {
                    if (bFirst)
                        bFirst = false;
                    else if (field.AllowMultipleValues) {
                        if (defaultMultiUserRender)
                            ret.push("</td></tr><tr><td class='ms-vb'>");
                        else if (!field.WithPicture && !field.WithPictureDetail && !field.PictureOnly)
                            ret.push("; ");
                    }
                    var userItem = userField[idx];

                    SetFieldClickInstrumentationData(userItem, listItem);
                    ret.push(RenderUserFieldWorker(renderCtx, field, userItem, listSchema));
                }
                if (defaultMultiUserRender)
                    ret.push("</td></tr></table>");
            }
            return ret.join('');
        }
        function RenderUserFieldWorker(renderCtx, field, listItem, listSchema) {
            var g_EmptyImnPawnHtml = "<span class='ms-spimn-presenceLink'><span class='{0}'><img class='{1}' name='imnempty' src='" + ListView.ImageBasePath + "/_layouts/15/images/spimn.png?rev=33" + "' alt='' /></span></span>";
            var g_ImnPawnHtml = "{0}<a href='#' onclick='IMNImageOnClick(event);return false;' class='{1}' {2}>{3}<img name='imnmark' title='' ShowOfflinePawn='1' class='{4}' src='" + ListView.ImageBasePath + "/_layouts/15/images/spimn.png?rev=33" + "' alt='";
            var ret = [];

            function GetImnPawnHtml(userSip, userEmail, alt, pictureSize, fNoImg) {
                var imnImgClass = "ms-spimn-img";
                var imnSpanClass = "ms-spimn-presenceWrapper";
                var imnLinkClass = "ms-imnlink";
                var additionalMarkup = "";
                var wrapperSpanMarkup = "";
                var imnSpanMarkup = "";

                if (fNoImg) {
                    imnSpanClass = (imnImgClass = " ms-hide");
                    additionalMarkup = "tabIndex='-1'";
                }
                else {
                    var height = SPClientTemplates.PresenceIndicatorSize.Square_10px;
                    var width = SPClientTemplates.PresenceIndicatorSize.Square_10px;

                    if (pictureSize != null && typeof pictureSize != 'undefined' && pictureSize != "None") {
                        height = String(parseInt(pictureSize.substring(5)));
                        if (pictureSize == "Size_72px") {
                            width = SPClientTemplates.PresenceIndicatorSize.Bar_8px;
                        }
                        else {
                            width = SPClientTemplates.PresenceIndicatorSize.Bar_5px;
                        }
                    }
                    else {
                        imnSpanClass += " ms-imnImg";
                    }
                    if (field.InlineRender) {
                        imnSpanClass += " ms-imnImgInline";
                    }
                    var sizeClass = String.format(" ms-spimn-imgSize-{0}x{1}", width, height);

                    imnImgClass += String.format(" ms-spimn-presence-disconnected-{0}x{1}x32", width, height);
                    imnSpanClass += sizeClass;
                    imnLinkClass += " ms-spimn-presenceLink";
                    wrapperSpanMarkup = String.format("<span class='{0}'>", imnSpanClass);
                    imnSpanMarkup = "<span class='ms-imnSpan'>";
                }
                if (userSip == null || userSip == '') {
                    if (userEmail == null || userEmail == '') {
                        ret.push(String.format(g_EmptyImnPawnHtml, imnSpanClass, imnImgClass));
                    }
                    else {
                        ret.push(String.format(g_ImnPawnHtml, imnSpanMarkup, imnLinkClass, additionalMarkup, wrapperSpanMarkup, imnImgClass));
                        ret.push(Encoding.HtmlEncode(alt));
                        ret.push("' sip='");
                        ret.push(Encoding.HtmlEncode(userEmail));
                        ret.push("' id='imn_");
                        ret.push(s_ImnId);
                        ret.push(",type=smtp' />" + (wrapperSpanMarkup.length > 0 ? "</span>" : "") + "</a>" + (imnSpanMarkup.length > 0 ? "</span>" : ""));
                    }
                }
                else {
                    ret.push(String.format(g_ImnPawnHtml, imnSpanMarkup, imnLinkClass, additionalMarkup, wrapperSpanMarkup, imnImgClass));
                    ret.push(Encoding.HtmlEncode(alt));
                    ret.push("' sip='");
                    ret.push(Encoding.HtmlEncode(userSip));
                    ret.push("' id='imn_");
                    ret.push(s_ImnId);
                    ret.push(",type=sip' />" + (wrapperSpanMarkup.length > 0 ? "</span>" : "") + "</a>" + (imnSpanMarkup.length > 0 ? "</span>" : ""));
                }
                s_ImnId++;
            }
            function GetPresence(userSip, userEmail) {
                if (listSchema.EffectivePresenceEnabled && (field.DefaultRender || field.WithPicture || field.WithPictureDetail || field.PictureOnly || field.PresenceOnly)) {
                    GetImnPawnHtml(userSip, userEmail, listSchema.PresenceAlt, field.PictureSize, false);
                }
            }
            function GetPresenceNoImg(userSip, userEmail) {
                if (listSchema.EffectivePresenceEnabled) {
                    GetImnPawnHtml(userSip, userEmail, listSchema.PresenceAlt, null, true);
                }
            }
            function UserLinkWithSize(pictureSize) {
                var userDispParam = listSchema.UserDispParam;

                if (field.HasUserLink && (Boolean(userDispParam) || lookupId != null && lookupId != '' && parseInt(lookupId) > -1)) {
                    var userDispUrlString = '';

                    if (Boolean(listSchema.UserDispUrl)) {
                        var httpRoot = renderCtx.HttpRoot;
                        var userDispUrlServerRelative = listSchema.UserDispUrl;
                        var userDispUrl = new URI(httpRoot + userDispUrlServerRelative);

                        if (Boolean(userDispParam)) {
                            userDispUrl.setQueryParameter(userDispParam, listItem[userDispParam]);
                        }
                        else {
                            userDispUrl.setQueryParameter("ID", String(lookupId));
                        }
                        userDispUrlString = userDispUrl.getString();
                    }
                    var linkClass = field.InlineRender ? "ms-link" : "ms-subtleLink";

                    linkClass += pictureSize != null && pictureSize.length > 0 ? " ms-peopleux-imgUserLink" : "";
                    if (typeof listItem.piCD != 'undefined' && listItem.piCD != "") {
                        if (typeof listItem.piPC != 'undefined' && listItem.piPC != "") {
                            ret.push("<a class=\"" + linkClass + "\" onclick=\"RecordClickForPaging('Author', '" + listItem.piCD + "','" + listItem.piPC + "'); GoToLinkOrDialogNewWindow(this);return false;\" href=");
                        }
                        else {
                            ret.push("<a class=\"" + linkClass + "\" onclick=\"RecordClick('Author', '" + listItem.piCD + "'); GoToLinkOrDialogNewWindow(this);return false;\" href=");
                        }
                    }
                    else if (typeof listItem.piClickClientData != 'undefined' && listItem.piClickClientData != "") {
                        ret.push("<a class=\"" + linkClass + "\" onclick=\"RecordClickClientId('Author', '" + listItem.piClickClientData + "'); GoToLinkOrDialogNewWindow(this);return false;\" href=");
                    }
                    else {
                        ret.push("<a class=\"" + linkClass + "\" onclick=\"GoToLinkOrDialogNewWindow(this);return false;\" href=");
                    }
                    ret.push(Encoding.AttrQuote(userDispUrlString));
                    ret.push(">");
                }
            }
            function UserLink() {
                UserLinkWithSize(null);
            }
            function RenderUserTitle(title) {
                ret.push("<span class=\"ms-noWrap ms-imnSpan\">");
                GetPresenceNoImg(sip, email);
                UserLink();
                ret.push(Encoding.HtmlEncode(title));
                if (field.HasUserLink)
                    ret.push("</a>");
                ret.push("</span>");
            }
            var lookupId = listItem.id;
            var lookupValue = listItem.title;

            if (lookupValue == null || lookupValue == '') {
                ret.push("<span class=\"ms-floatLeft ms-peopleux-vanillaUser\" />");
                return ret.join('');
            }
            var sip = listItem.sip;
            var email = listItem.email;

            function RenderVanillaUser() {
                if (!listSchema.UserVanilla) {
                    if (false) {
                        ret.push("<span class=\"ms-verticalAlignTop ms-noWrap ms-displayInlineBlock\" " + GetSharedHoverCardFieldsMarkup() + ">");
                    }
                    else {
                        ret.push("<span class=\"ms-verticalAlignTop ms-noWrap ms-displayInlineBlock\">");
                    }
                    GetPresence(sip, email);
                    RenderUserTitle(lookupValue);
                    ret.push("</span>");
                }
                else {
                    if (false) {
                        ret.push("<span " + GetSharedHoverCardFieldsMarkup() + ">");
                    }
                    RenderUserTitle(lookupValue);
                    if (false) {
                        ret.push("</span>");
                    }
                }
            }
            function GetSharedHoverCardFieldsMarkup() {
                return " name='SharedHoverCardMarker'" + "sip='" + GetUserEmail() + "' " + "userTitle='" + GetUserTitle() + "' ";
            }
            function GetUserTitle() {
                var userTitle = lookupValue;

                if (userTitle == null) {
                    userTitle = '';
                }
                return userTitle;
            }
            function GetUserEmail() {
                var userSip = sip;

                if (userSip == null || userSip == '') {
                    userSip = email;
                }
                return userSip == null ? '' : userSip;
            }
            var ProfilePicture_Suffix_Small = "_SThumb";
            var ProfilePicture_Suffix_Medium = "_MThumb";
            var ProfilePicture_Suffix_Large = "_LThumb";
            var SmallThumbnailThreshold = 48;

            function GetPictureThumbnailUrl(pictureUrl, suffixToReplace) {
                var fileNameWithoutExt = pictureUrl.substr(0, pictureUrl.lastIndexOf("."));

                if (fileNameWithoutExt.endsWith(ProfilePicture_Suffix_Medium)) {
                    if (suffixToReplace == ProfilePicture_Suffix_Medium)
                        return pictureUrl;
                    return pictureUrl.replace(ProfilePicture_Suffix_Medium, suffixToReplace);
                }
                return pictureUrl;
            }
            function AppendUserPhotoUrl(arrayToAppend, sizeToRequest, pictureUrl) {
                (function() {
                    if (!false) {
                        if (confirm("Assertion failed: " + "User photo not (yet) supported in standalone list view." + ". Break into debugger?"))
                            eval("debugger");
                    }
                })();
                ;
            }
            function RenderPicture(fieldToRender) {
                var picture = listItem.picture;
                var pictureSize = fieldToRender.PictureSize != null ? Encoding.HtmlEncode(fieldToRender.PictureSize.substring(5)) : null;

                ret.push("<span class=\"ms-imnSpan\">");
                GetPresenceNoImg(sip, email);
                if (field.HasUserLink)
                    UserLinkWithSize(pictureSize);
                else
                    ret.push("<span class=\"ms-peopleux-imgUserLink\">");
                if (pictureSize != null) {
                    ret.push("<span class=\"ms-peopleux-userImgWrapper\" style=\"width:" + pictureSize + "; height:" + pictureSize + "\">");
                    ret.push("<img class=\"ms-peopleux-userImg\" style=\"min-width:" + pictureSize + "; min-height:" + pictureSize + "; ");
                    ret.push("clip:rect(0px, " + pictureSize + ", " + pictureSize + ", 0px); max-width:" + pictureSize + "\" src=\"");
                }
                else {
                    pictureSize = "62px";
                    ret.push("<img style=\"width:62px; height:62px; border:none\" src=\"");
                }
                var sizeToRequest = CSSUtil.pxToNum(pictureSize) <= SmallThumbnailThreshold ? 'S' : 'M';

                if (picture == null || picture == '') {
                    ret.push(ListView.ImageBasePath + "/_layouts/15/images/person.gif?rev=33");
                    ret.push("\" alt=\"");
                    ret.push(Encoding.HtmlEncode(listSchema.picturealt1));
                    ret.push(" ");
                    ret.push(Encoding.HtmlEncode(lookupValue));
                    ret.push("\" />");
                }
                else {
                    if (parseInt(pictureSize) <= SmallThumbnailThreshold) {
                        picture = GetPictureThumbnailUrl(picture, ProfilePicture_Suffix_Small);
                    }
                    ret.push(Encoding.HtmlEncode(picture));
                    ret.push("\" alt=\"");
                    ret.push(Encoding.HtmlEncode(listSchema.picturealt2));
                    ret.push(" ");
                    ret.push(Encoding.HtmlEncode(lookupValue));
                    ret.push("\" />");
                }
                if (pictureSize != null)
                    ret.push("</span>");
                if (field.HasUserLink)
                    ret.push("</a>");
                else
                    ret.push("</span>");
                ret.push("</span>");
            }
            var picSize = "0px";

            if (field.PictureSize != null && typeof field.PictureSize != 'undefined')
                picSize = Encoding.HtmlEncode(field.PictureSize.substring(5));
            if (field.WithPictureDetail) {
                var jobTitle = listItem.jobTitle;
                var department = listItem.department;

                if (picSize == null || typeof picSize == 'undefined') {
                    picSize = "36px";
                }
                var detailsMaxWidth = 150;

                if (field.MaxWidth != null && typeof field.MaxWidth != 'undefined') {
                    detailsMaxWidth = field.MaxWidth - 10 - parseInt(picSize) - 11;
                    if (detailsMaxWidth < 0) {
                        detailsMaxWidth = 0;
                    }
                }
                if (false) {
                    ret.push("<div class=\"ms-table ms-core-tableNoSpace\" " + GetSharedHoverCardFieldsMarkup() + ">");
                }
                else {
                    ret.push("<div class=\"ms-table ms-core-tableNoSpace\">");
                }
                ret.push("<div class=\"ms-tableRow\">");
                ret.push("<div class=\"ms-tableCell\">");
                GetPresence(sip, email);
                ret.push("</span></div><div class=\"ms-tableCell ms-verticalAlignTop\"><div class=\"ms-peopleux-userImgDiv\">");
                RenderPicture(field);
                ret.push("</div></div><div class=\"ms-tableCell ms-peopleux-userdetails ms-noList\"><ul style=\"max-width:" + String(detailsMaxWidth) + "px\"><li>");
                ret.push("<div class=\"ms-noWrap" + (parseInt(picSize) >= 48 ? " ms-textLarge" : "") + "\">");
                RenderUserTitle(lookupValue);
                ret.push("</div>");
                ret.push("</li>");
                var customDetail = listItem.CustomDetail;
                var renderCallback = field.RenderCallback;

                if (renderCallback != null || typeof renderCallback != 'undefined') {
                    renderCtx.sip = sip;
                    var result = eval(renderCallback + "(renderCtx);");

                    ret.push("<li>");
                    ret.push(result);
                    ret.push("</li>");
                }
                else if (customDetail != null || typeof customDetail != 'undefined') {
                    ret.push("<li><div class=\"ms-metadata ms-textSmall ms-peopleux-detailuserline ms-noWrap\" title=\"" + Encoding.HtmlEncode(customDetail) + "\">");
                    ret.push(Encoding.HtmlEncode(customDetail));
                    ret.push("</div></li>");
                }
                else if (jobTitle != null && jobTitle != '') {
                    var detailLine = jobTitle;

                    if (department != null && department != '')
                        detailLine += ", " + department;
                    ret.push("<li><div class=\"ms-metadata ms-textSmall ms-peopleux-detailuserline\" title=\"" + Encoding.HtmlEncode(detailLine) + "\">");
                    ret.push(Encoding.HtmlEncode(detailLine));
                    ret.push("</div></li>");
                }
                ret.push("</ul></div></div></div>");
            }
            else if (field.PictureOnly) {
                if (false) {
                    ret.push("<div class=\"ms-table ms-core-tableNoSpace\" " + GetSharedHoverCardFieldsMarkup() + ">");
                    ret.push("<div class=\"ms-tableRow\"><div class=\"ms-tableCell\">");
                }
                else {
                    ret.push("<div class=\"ms-table ms-core-tableNoSpace\"><div class=\"ms-tableRow\"><div class=\"ms-tableCell\">");
                }
                GetPresence(sip, email);
                ret.push("</span></div><div class=\"ms-tableCell ms-verticalAlignTop\"><div class=\"ms-peopleux-userImgDiv\">");
                RenderPicture(field);
                ret.push("</div></div></div></div>");
            }
            else if (field.WithPicture) {
                ret.push("<div><div>");
                RenderPicture(field);
                ret.push("</div><div class=\"ms-floatLeft ms-descriptiontext\">");
                RenderVanillaUser();
                ret.push("</div></div>");
            }
            else if (field.NameWithContactCard) {
                if (false) {
                    ret.push("<span " + GetSharedHoverCardFieldsMarkup() + ">");
                }
                RenderUserTitle(lookupValue);
                if (false) {
                    ret.push("</span>");
                }
            }
            else if (field.PresenceOnly) {
                GetPresence(sip, email);
            }
            else
                RenderVanillaUser();
            return ret.join('');
        }
        function RenderAndRegisterHierarchyItem(renderCtx, field, listItem, listSchema, content) {
            if (renderCtx.inGridMode) {
                return content;
            }
            var indentSize = renderCtx.ListData.HierarchyHasIndention ? 22 : 0;
            var imgOffsetSize = renderCtx.ListData.HierarchyHasIndention ? 13 : 0;
            var ret = [];
            var trId = renderCtx.ctxId + ',' + listItem.ID + ',' + listItem.FSObjType;
            var imgId = 'idExpandCollapse' + trId;

            ret.push('<span style="');
            if (listItem.isParent) {
                ret.push('font-weight: bold;');
            }
            ret.push('float: ');
            ret.push(DOM.rightToLeft ? 'right' : 'left');
            ret.push('; margin-');
            ret.push(DOM.rightToLeft ? 'right' : 'left');
            ret.push(':');
            var outlineLevel = parseInt(listItem.outlineLevel);

            if (outlineLevel <= 1) {
                indentLevel = listItem.isParent ? 0 : imgOffsetSize;
            }
            else {
                var indentLevel = (outlineLevel - 1) * indentSize;

                if (!listItem.isParent) {
                    indentLevel += imgOffsetSize;
                }
            }
            ret.push(indentLevel);
            ret.push('px">');
            ret.push('<table><tr>');
            if (listItem.isParent) {
                ret.push('<td style="vertical-align: top;"><span id="');
                ret.push(imgId);
                ret.push('" class="ms-commentcollapse' + (DOM.rightToLeft ? 'rtl' : '') + '-iconouter"><img src="');
                ret.push(GetThemedImageUrl("spcommon.png"));
                ret.push('" class="ms-commentcollapse' + (DOM.rightToLeft ? 'rtl' : '') + '-icon"/></span></td>');
            }
            ret.push('<td>');
            ret.push(content);
            ret.push('</td></tr></table></span>');
            function PostRenderRegisterHierarchyItem() {
                var hierarchyMgr = renderCtx.hierarchyMgr;

                if (hierarchyMgr == null) {
                    hierarchyMgr = (renderCtx.hierarchyMgr = GetClientHierarchyManagerForWebpart(renderCtx.wpq, DOM.rightToLeft));
                }
                if (listItem.isParent) {
                    var img = document.getElementById(imgId);

                    if (img != null) {
                        $addHandler(img, 'click', OnExpandCollapseButtonClick);
                    }
                    (function() {
                        if (!false) {
                            if (confirm("Assertion failed: " + "Standalone list view can't use functions from core.js to render." + ". Break into debugger?"))
                                eval("debugger");
                        }
                    })();
                    ;
                }
                hierarchyMgr.RegisterHierarchyNode(parseInt(listItem.ID), listItem.parentID == null ? null : parseInt(listItem.parentID), trId, imgId);
            }
            AddPostRenderCallback(renderCtx, function() {
                setTimeout(PostRenderRegisterHierarchyItem, 0);
            });
            return ret.join('');
        }
        function OnPostRenderTabularListView(renderCtx) {
            setTimeout(function() {
                OnPostRenderTabularListViewDelayed(renderCtx);
            }, 100);
        }
        function OnPostRenderTabularListViewDelayed(renderCtx) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "Standalone list view doesn't support inplview-based delayed loading." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function ListHeaderTouchHandler(evt) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "Standalone list view doesn't (yet) support menus or touch events." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            return false;
        }
        function SPMgr() {
            this.NewGroup = function(listItem, fieldName) {
                if (listItem[fieldName] == '1')
                    return true;
                else
                    return false;
            };
            function DefaultRenderField(renderCtx, field, listItem, listSchema) {
                if (typeof field.FieldRenderer == 'undefined') {
                    var fieldRenderMap = {
                        Computed: new ComputedFieldRenderer(field.Name),
                        Attachments: new AttachmentFieldRenderer(field.Name),
                        User: new UserFieldRenderer(field.Name),
                        UserMulti: new UserFieldRenderer(field.Name),
                        URL: new UrlFieldRenderer(field.Name),
                        Note: new NoteFieldRenderer(field.Name),
                        Recurrence: new RecurrenceFieldRenderer(field.Name),
                        CrossProjectLink: new ProjectLinkFieldRenderer(field.Name),
                        AllDayEvent: new AllDayEventFieldRenderer(field.Name),
                        Number: new NumberFieldRenderer(field.Name),
                        BusinessData: new BusinessDataFieldRenderer(field.Name),
                        Currency: new NumberFieldRenderer(field.Name),
                        DateTime: new DateTimeFieldRenderer(field.Name),
                        Text: new TextFieldRenderer(field.Name),
                        Lookup: new LookupFieldRenderer(field.Name),
                        LookupMulti: new LookupFieldRenderer(field.Name),
                        WorkflowStatus: new RawFieldRenderer(field.Name)
                    };

                    if (field.XSLRender == '1') {
                        field.FieldRenderer = new RawFieldRenderer(field.Name);
                    }
                    else {
                        field.FieldRenderer = fieldRenderMap[field.FieldType];
                        if (field.FieldRenderer == null)
                            field.FieldRenderer = fieldRenderMap[field.Type];
                    }
                    if (field.FieldRenderer == null)
                        field.FieldRenderer = new FieldRenderer(field.Name);
                }
                return field.FieldRenderer.RenderField(renderCtx, field, listItem, listSchema);
            }
            function RenderFieldHeaderCore(renderCtx, listSchema, field) {
                var iStr;

                if (field.Sortable != 'FALSE') {
                    var listData = renderCtx.ListData;

                    iStr = '<a class="ms-headerSortTitleLink" id="diidSort';
                    iStr += renderCtx.ctxId;
                    iStr += field.Name;
                    iStr += '" onfocus="OnFocusFilter(this)"';
                    if (!field.IconOnlyHeader) {
                        iStr += ' onclick="javascript: var pointerType = this.getAttribute(\'pointerType\'); if (pointerType != null && typeof MSPointerEvent != \'undefined\' && Number(pointerType) != MSPointerEvent.MSPOINTER_TYPE_MOUSE) { ListHeaderTouchHandler(event); return false; } return OnClickFilter(this, event);"';
                    }
                    iStr += 'href="javascript: " SortingFields="';
                    iStr += SortFields(field, listData, listSchema);
                    iStr += '" Title="';
                    iStr += GetString("L_OpenMenuKeyAccessible");
                    iStr += '">';
                    iStr += field.FieldTitle;
                    iStr += '</a>';
                    iStr += RenderFieldHeaderCore_RenderSortArrowGlyph(renderCtx, field);
                    iStr += RenderFieldHeaderCore_RenderFilterGlyph(renderCtx, field);
                }
                else if (field.Filterable != 'FALSE') {
                    iStr = '<span id="diidSort';
                    iStr += renderCtx.ctxId;
                    iStr += field.Name;
                    iStr += '">';
                    iStr += field.FieldTitle;
                    iStr += '</span>';
                    iStr += RenderFieldHeaderCore_RenderFilterGlyph(renderCtx, field);
                }
                else {
                    iStr = "<span title=\"" + GetString("L_CSR_NoSortFilter") + "\">" + field.FieldTitle + "</span>";
                }
                return iStr;
            }
            function RenderFieldHeaderCore_RenderSortArrowGlyph(renderCtx, field) {
                var iStr;
                var listData = renderCtx.ListData;
                var bShowSortIcon = field.Name == listData.Sortfield;
                var bAscending = listData.SortDir == 'ascending';
                var spanClass = bAscending ? "ms-sortarrowup-iconouter" : "ms-sortarrowdown-iconouter";
                var imgClass = bAscending ? "ms-sortarrowup-icon" : "ms-sortarrowdown-icon";

                iStr = '<span class="' + spanClass + '"';
                iStr += ' id="diidSortArrowSpan';
                iStr += renderCtx.ctxId;
                iStr += field.Name;
                iStr += '"';
                if (!bShowSortIcon) {
                    iStr += ' style="display: none;"';
                }
                iStr += '><img class="' + imgClass + '" src="' + GetThemedImageUrl("spcommon.png") + '" alt="" /></span>';
                return iStr;
            }
            function RenderFieldHeaderCore_RenderFilterGlyph(renderCtx, field) {
                var iStr;
                var listData = renderCtx.ListData;
                var bShowFilterIcon = listData.FilterFields != null && listData.FilterFields.indexOf(';' + field.Name + ';') >= 0;

                iStr = '<span class="ms-filter-iconouter"';
                iStr += ' id="diidFilterSpan';
                iStr += renderCtx.ctxId;
                iStr += field.Name;
                iStr += '"';
                if (!bShowFilterIcon) {
                    iStr += ' style="display: none;"';
                }
                iStr += '><img class="ms-filter-icon" src="' + GetThemedImageUrl("spcommon.png") + '" alt="" /></span>';
                return iStr;
            }
            function RenderHeaderField(renderCtx, field) {
                var listSchema = renderCtx.ListSchema;
                var listData = renderCtx.ListData;

                if (listSchema.Filter == '1')
                    return field.Filter;
                var iStr;

                if (field.Type == "Number" || field.Type == "Currency") {
                    iStr = '<div align="right" class="ms-numHeader">';
                    iStr += RenderFieldHeaderCore(renderCtx, listSchema, field);
                    iStr += '</div>';
                }
                else {
                    iStr = RenderFieldHeaderCore(renderCtx, listSchema, field);
                }
                if (field.FieldType == 'BusinessData') {
                    (function() {
                        if (!false) {
                            if (confirm("Assertion failed: " + "BusinessData fields not (yet) supported in standalone list view." + ". Break into debugger?"))
                                eval("debugger");
                        }
                    })();
                    ;
                }
                return iStr;
            }
            function SortFields(field, listData, listSchema) {
                var iStr = listSchema.RootFolderParam;

                iStr += listSchema.FieldSortParam;
                iStr += 'SortField=';
                iStr += field.Name;
                iStr += '&SortDir=';
                if (listData.SortField == field.Name && (listData.SortDir == "ascending" || listData.SortDir == "ASC"))
                    iStr += "Desc";
                else
                    iStr += "Asc";
                return iStr;
            }
            function RenderDVTHeaderField(renderCtx, field) {
                var listSchema = renderCtx.ListSchema;
                var listData = renderCtx.ListData;
                var iStr = "";

                iStr += '<div Sortable="';
                iStr += field.Sortable == null ? '' : field.Sortable;
                iStr += '" SortDisable="" FilterDisable="" Filterable="';
                iStr += field.Filterable == null ? '' : field.Filterable;
                iStr += '" FilterDisableMessage="';
                iStr += field.FilterDisableMessage == null ? '' : field.FilterDisableMessage;
                iStr += '" name="';
                iStr += field.Name;
                iStr += '" CTXNum="';
                iStr += renderCtx.ctxId;
                iStr += '" DisplayName="';
                iStr += Encoding.HtmlEncode(field.DisplayName);
                iStr += '" FieldType="';
                iStr += field.FieldType;
                iStr += '" ResultType="';
                iStr += field.ResultType == null ? '' : field.ResultType;
                iStr += '" SortFields="';
                iStr += SortFields(field, listData, listSchema);
                iStr += '" class="ms-vh-div">';
                iStr += RenderHeaderField(renderCtx, field);
                iStr += '</div>';
                if (field.Sortable != 'FALSE' && field.Type != 'MultiChoice' || field.Filterable != 'FALSE' && field.Type != 'Note' && field.Type != 'URL') {
                    iStr += '<div class="ms-positionRelative">';
                    iStr += '<div class="s4-ctx"><span> </span><a onfocus="OnChildColumn(this.parentNode.parentNode.parentNode); return false;" ';
                    iStr += 'class="ms-headerSortArrowLink" onclick="PopMenuFromChevron(event); return false;" href="javascript:;" title="';
                    iStr += GetString("L_OpenMenu");
                    iStr += '"><img style="visibility: hidden;" src="' + GetThemedImageUrl("ecbarw.png") + '" alt=\"" + Encoding.HtmlEncode(Strings.STS.L_OpenMenu) + "\" ms-jsgrid-click-passthrough=\"true\"></a><span> </span></div>';
                    iStr += '</div>';
                }
                return iStr;
            }
            function RenderIconHeader(renderCtx, field, imageUrl, bAttachment) {
                var iStr = '<th class="ms-vh-icon ms-minWidthHeader" scope="col" onmouseover="OnChildColumn(this)">';

                field.FieldTitle = '<img border="0" width="16" height="16" ';
                if (bAttachment)
                    field.FieldTitle += 'alt=' + Encoding.AttrQuote(GetString("L_ListFieldAttachments")) + ' ';
                field.FieldTitle += 'src="' + imageUrl + '"/>';
                field.IconOnlyHeader = true;
                iStr += RenderDVTHeaderField(renderCtx, field);
                iStr += '</th>';
                return iStr;
            }
            function RenderAttachmentsHeader(renderCtx, field) {
                return RenderIconHeader(renderCtx, field, GetThemedImageUrl("attach16.png"), true);
            }
            function RenderComputedHeader(renderCtx, field) {
                if (field.Name == "DocIcon" && field.RealFieldName == "DocIcon")
                    return RenderIconHeader(renderCtx, field, ListView.ImageBasePath + '/_layouts/15/images/icgen.gif');
                else
                    return RenderDefaultHeader(renderCtx, field);
            }
            function RenderSelectedFlagHeader(renderCtx, field) {
                var iStr = '<th scope="col" class="ms-vh3-nograd">';

                iStr += '<img id="diidHeaderImageSelectedFlag" alt="';
                iStr += GetString("L_SPSelection_Checkbox");
                iStr += '" src="' + ListView.ImageBasePath + '/_layouts/15/images/blank.gif' + '" width="16" height="16" border="0"/>';
                iStr += '</th>';
                return iStr;
            }
            function RenderCheckmarkHeader(renderCtx, field) {
                var ret = [];
                var content = [];

                content.push('<div class="ms-chkmark-container" style="cursor: default;">');
                content.push('<div class="ms-chkmark-container-centerer">');
                content.push('<span class="ms-cui-img-16by16 ms-cui-img-cont-float" unselectable="on">');
                content.push('<img class="ms-chkmark-marktaskcomplete" src="');
                content.push(GetThemedImageUrl('spcommon.png'));
                content.push('"/></span></div></div>');
                field.FieldTitle = content.join('');
                ret.push('<th scope="col" class="ms-vh2" style="padding-left: 5px;width: 50px;" onmouseover="OnChildColumn(this)" onmousedown="ListModule.Util.headerMenuMouseDown(this);" scope="col">');
                ret.push(RenderDVTHeaderField(renderCtx, field));
                ret.push('</th>');
                return ret.join('');
            }
            function RenderDateTimeHeader(renderCtx, field) {
                var iStr = '<th class="ms-vh2" scope="col" onmouseover="OnChildColumn(this)" onmousedown="ListModule.Util.headerMenuMouseDown(this);">';

                field.FieldTitle = Encoding.HtmlEncode(field.DisplayName);
                iStr += RenderDVTHeaderField(renderCtx, field);
                iStr += '</th>';
                return iStr;
            }
            function RenderRecurrenceHeader(renderCtx, field) {
                var iStr = '<th class="ms-vh-icon" scope="col" onmouseover="OnChildColumn(this)" onmousedown="ListModule.Util.headerMenuMouseDown(this);">';

                field.FieldTitle = '<IMG id="diidHeaderImagefRecurrence" src="' + ListView.ImageBasePath + '/_layouts/15/images/recurrence.gif' + '" width="16" height="16" border="0" >';
                iStr += RenderDVTHeaderField(renderCtx, field);
                iStr += '</th>';
                return iStr;
            }
            function RenderDefaultHeader(renderCtx, field) {
                var iStr = '<th scope="col" onmouseover="OnChildColumn(this)" style="max-width: 500px;" class="';

                if ((field.Type == 'User' || field.Type == 'UserMulti') && renderCtx.ListSchema.EffectivePresenceEnabled) {
                    iStr += 'ms-vh';
                }
                else {
                    iStr += field.Filterable != 'FALSE' || field.Sortable != 'FALSE' ? 'ms-vh2' : 'ms-vh2-nofilter';
                }
                if (field.Name == "DocIcon") {
                    iStr += ' ms-minWidthHeader';
                }
                iStr += '" onmousedown="ListModule.Util.headerMenuMouseDown(this);">';
                field.FieldTitle = Encoding.HtmlEncode(field.DisplayName);
                iStr += RenderDVTHeaderField(renderCtx, field);
                iStr += '</th>';
                return iStr;
            }
            function RenderCrossProjectLinkHeader(renderCtx, field) {
                var iStr = '<th class="ms-vh-icon" scope="col" onmouseover="OnChildColumn(this)">';
                var themedImgUrl = GetThemedImageUrl("mtgicnhd.gif");

                field.FieldTitle = '<IMG id="diidHeaderImageWorkspaceLink" src="' + themedImgUrl + '" width="16" height="16" border="0" >';
                iStr += RenderDVTHeaderField(renderCtx, field);
                iStr += '</th>';
                return iStr;
            }
            this.RenderHeader = function(renderCtx, field) {
                if (field.Name == 'SelectedFlag')
                    return RenderSelectedFlagHeader(renderCtx, field);
                else if (field.Name == 'Checkmark')
                    return RenderCheckmarkHeader(renderCtx, field);
                var fieldHeaderRenderMap = {
                    Attachments: RenderAttachmentsHeader,
                    Computed: RenderComputedHeader,
                    CrossProjectLink: RenderCrossProjectLinkHeader,
                    Recurrence: RenderRecurrenceHeader,
                    DateTime: RenderDateTimeHeader
                };
                var headerRenderer = fieldHeaderRenderMap[field.Type];

                if (headerRenderer != null)
                    return headerRenderer(renderCtx, field);
                return RenderDefaultHeader(renderCtx, field);
            };
            this.RenderField = function(renderCtx, field, listItem, listSchema) {
                if (typeof field.fieldRenderer == 'undefined') {
                    var fieldTpls = renderCtx.Templates['Fields'];
                    var tpl;
                    var fldName = field.Name;

                    if (fieldTpls[fldName] != null)
                        tpl = fieldTpls[fldName];
                    var tplFunc;

                    if (tpl != null && tpl != '' && tpl != RenderFieldValueDefault) {
                        if (typeof tpl == "string")
                            tplFunc = SPClientRenderer.ParseTemplateString(tpl, renderCtx);
                        else if (typeof tpl == "function")
                            tplFunc = tpl;
                    }
                    else
                        tplFunc = DefaultRenderField;
                    field.fieldRenderer = tplFunc;
                }
                renderCtx['CurrentFieldSchema'] = field;
                var retStr = field.fieldRenderer(renderCtx, field, listItem, listSchema);

                renderCtx['CurrentFieldSchema'] = null;
                if (field.Direction != null) {
                    var ret = [];

                    ret.push("<span dir=\"");
                    ret.push(field.Direction);
                    ret.push("\">");
                    ret.push(retStr);
                    ret.push("</span>");
                    retStr = ret.join('');
                }
                if (field.linkToItem != null) {
                    ret = [];
                    if (listItem.FSObjType == '1') {
                        if (listSchema.IsDocLib == '1') {
                            RenderDocFolderLink(ret, retStr, listItem, listSchema);
                        }
                        else {
                            RenderListFolderLink(ret, retStr, listItem, listSchema);
                        }
                    }
                    else {
                        RenderTitle(ret, renderCtx, listItem, listSchema, LinkTitleValue(listItem[field.Name]), true);
                    }
                    retStr = ret.join('');
                }
                if (listSchema.UseParentHierarchy && listSchema.ParentHierarchyDisplayField == field.Name) {
                    retStr = RenderAndRegisterHierarchyItem(renderCtx, field, listItem, listSchema, retStr);
                }
                var isCustomData = listItem["CustomData."];

                if (isCustomData == null || typeof isCustomData == 'undefined' || Boolean(isCustomData) == false) {
                    if (field.CalloutMenu != null) {
                        retStr = RenderCalloutMenu(renderCtx, listItem, field, retStr, IsCSRReadOnlyTabularView(renderCtx));
                    }
                    else if (field.listItemMenu != null) {
                        retStr = RenderECB(renderCtx, listItem, field, retStr, IsCSRReadOnlyTabularView(renderCtx));
                    }
                }
                return retStr;
            };
            this.RenderFieldByName = function(renderCtx, fieldName, listItem, listSchema) {
                var ret = '';
                var rendered = false;

                for (var idx in listSchema.Field) {
                    var field = listSchema.Field[idx];

                    if (field.Name == fieldName) {
                        var oldField = renderCtx.CurrentFieldSchema;

                        renderCtx.CurrentFieldSchema = field;
                        ret = this.RenderField(renderCtx, field, listItem, listSchema);
                        renderCtx.CurrentFieldSchema = oldField;
                        rendered = true;
                        break;
                    }
                }
                if (!rendered)
                    ret = Encoding.HtmlEncode(listItem[fieldName]);
                return ret;
            };
        }
        ;
        SPMgr.prototype = {
            NewGroup: undefined,
            RenderField: undefined,
            RenderFieldByName: undefined
        };
        var spMgr = new SPMgr();

        function OnTableMouseDown(evt) {
            if (evt == null) {
                evt = window.event;
            }
            if (evt.ctrlKey || evt.shiftKey) {
                return DOM.CancelEvent(evt);
            }
            return true;
        }
        function FHasRowHoverBehavior(ctxCur) {
            var browseris = {
                ie8down: false,
                ipad: false
            };

            return !browseris.ie8down && !browseris.ipad && ctxCur != null && ctxCur.ListData != null && ctxCur.ListData.Row != null && ctxCur.ListData.Row.length < 50;
        }
        function AddUIInstrumentationClickEvent(ret, listItem, clickType) {
            if (typeof listItem.piCD != "undefined" && listItem.piCD != "") {
                if (typeof listItem.piPC != "undefined" && listItem.piPC != "") {
                    ret.push("RecordClickForPaging('" + Encoding.HtmlEncode(clickType) + "','");
                    ret.push(Encoding.HtmlEncode(listItem.piCD));
                    ret.push("','");
                    ret.push(Encoding.HtmlEncode(listItem.piPC));
                }
                else {
                    ret.push("RecordClick('Navigation','");
                    ret.push(Encoding.HtmlEncode(listItem.piCD));
                }
                ret.push("');");
            }
        }
        function InitializeSingleItemPictureView() {
            var SingleItemOverride = {};

            SingleItemOverride.Templates = {};
            SingleItemOverride.BaseViewID = 2;
            SingleItemOverride.ListTemplateType = 109;
            SingleItemOverride.Templates.Item = SingleItem_RenderItemTemplate;
            SingleItemOverride.Templates.Footer = SingleItem_RenderFooterTemplate;
            SingleItemOverride.Templates.Header = SingleItem_RenderHeaderTemplate;
            SPClientTemplates.TemplateManager.RegisterTemplateOverrides(SingleItemOverride);
        }
        function SingleItem_RenderHeaderTemplate(renderCtx) {
            var listSchema = renderCtx.ListSchema;
            var ret = [];

            ret.push("<div>");
            if (listSchema.RenderViewSelectorPivotMenu == "True")
                ret.push(RenderViewSelectorPivotMenu(renderCtx));
            else if (listSchema.RenderViewSelectorPivotMenuAsync == "True")
                ret.push(RenderViewSelectorPivotMenuAsync(renderCtx));
            ret.push("</div>");
            return ret.join("");
        }
        function SingleItem_RenderFooterTemplate(renderCtx) {
            return "";
        }
        function RenderSingleItemTopPagingControl(renderCtx) {
            var ret = [];
            var strRet = "<div>";

            RenderPagingControlNew(ret, renderCtx, false, "", "topPaging");
            strRet += ret.join('');
            strRet += "</div>";
            return strRet;
        }
        function SingleItem_RenderItemTemplate(renderCtx) {
            var strTrTdBegin = "<tr><td colspan='100'>";
            var strTrTdEnd = "</td></tr>";
            var strRet = strTrTdBegin;

            strRet += RenderSingleItemTopPagingControl(renderCtx);
            strRet += strTrTdEnd;
            strRet += strTrTdBegin;
            strRet += SingleItem_RenderItem(renderCtx.CurrentItem);
            strRet += strTrTdEnd;
            return strRet;
        }
        function SingleItem_RenderItem(curItem) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "Standalone list view can't use Strings.STS strings that aren't from initstrings." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            return "";
        }
        function GetRelativeUrlToSlideShowView(listItem) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "SlideShowView not supported (yet) in standalone list view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            return null;
        }
        function IsPictureFile(strFileExtension) {
            if (strFileExtension == null)
                return false;
            var rgstrPictureExtensions = ["jpg", "jpeg", "bmp", "png", "gif"];

            for (var i = 0; i < rgstrPictureExtensions.length; i++) {
                if (strFileExtension.toLowerCase() == rgstrPictureExtensions[i]) {
                    return true;
                }
            }
            return false;
        }
        function GetPictureUrl(listItem) {
            var strUrl = listItem["FileDirRef"] + "/" + listItem["FileLeafRef"];

            return EncodeUrl(strUrl);
        }
        function ToggleMaxWidth(elm) {
            var maxWidth = elm.style.maxWidth;

            if (maxWidth == null || maxWidth == "") {
                elm.style.maxWidth = "800px";
            }
            else {
                elm.style.maxWidth = "";
            }
        }
        InitializeSingleItemPictureView();
        if (typeof console == 'undefined')
            console = {};
        if (typeof console.log == 'undefined')
            console.log = function(s) {
            };
        window.OnChildColumn = function() {
            console.log("OnChildColumn");
        };
        window.EnsureSelectionHandler = function(a, b, c) {
            console.log("EnsureSelectionHandler");
        };
        window.OnLink = function(e) {
            console.log("OnLink");
        };
        window.EditLink2 = function(e) {
            Nav.goToLink(e);
            return false;
        };
        window.CoreInvoke = function() {
            var args = Array.prototype.slice.call(arguments, 0);
            var fn = args.shift();

            if (typeof window[fn] == "function") {
                window[fn].apply(this, args);
            }
            else {
                (function() {
                    if (!false) {
                        if (confirm("Assertion failed: " + fn + ". Break into debugger?"))
                            eval("debugger");
                    }
                })();
                ;
            }
        };
        window.OnFocusFilter = function() {
            console.log("OnFocusFilter");
        };
        window.OnClickFilter = function(obj) {
            return OnClickFilterV4(obj);
        };
        window.IMNImageOnClick = function() {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "IMNImageOnClick" + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        };
        window.OnTableMouseDown = OnTableMouseDown;
        window.RefreshPageTo = RefreshPageToEx;
        window.GoToLinkOrDialogNewWindow = Nav.goToLinkOrDialogNewWindow;
        window.ShowECBMenuForTr = ListModule.Util.showEcbMenuForTr;
        window.OpenCalloutAndSelectItem = function(launchPoint, evt) {
            ListModule.Util.showEcbMenuForTr(launchPoint, evt, ListView.Strings);
        };
        function SelectedItem() {
        }
        SelectedItem.prototype = {
            id: undefined,
            fsObjType: undefined
        };
        function SwapNode(node1, node2) {
            return node1.parentNode.replaceChild(node2, node1);
        }
        function CountDictionary(dictParam) {
            var i = 0;
            var k;

            for (k in dictParam)
                i++;
            return i;
        }
        function EncodeQueryStringAsHash(str) {
            return (str.replace(/-/g, '--')).replace(/&/g, '-');
        }
        function DecodeHashAsQueryString(str) {
            return (str.replace(/-/g, '&')).replace(/&&/g, '-');
        }
        function CLVP_InitializePrototype() {
            CLVP.prototype = {
                outstandingRequest: undefined,
                bRequestOutstanding: false,
                cctx: undefined,
                ctx: undefined,
                dsrc: null,
                fnEcbCallback: null,
                fRestore: false,
                inplUrl: null,
                isEcbInfo: false,
                isInserting: false,
                pagingTab: null,
                queueEcbInfo: [],
                rgehs: undefined,
                rgpag: null,
                rgpaging: null,
                rootFolder: null,
                rootFolderGuid: null,
                strGroupCache: null,
                strGroupName: null,
                tBody: null,
                tab: null,
                trEmpty: null,
                wpid: null,
                wpq: null,
                strHash: "",
                xmlHttpCtr: window['Office']['Controls']['ListView']['ListViewXHR'],
                CancelAnyOutstandingRequest: CLVPCancelAnyOutstandingRequest,
                CacheEcbInfo: CLVPCacheEcbInfo,
                CacheGroupName: CLVPCacheGroupName,
                CheckinItem: CLVPCheckinItem,
                CheckoutItem: CLVPCheckoutItem,
                DeleteGroupNameCache: CLVPDeleteGroupNameCache,
                DeleteItemCore: CLVPDeleteItemCore,
                DiscardCheckoutItem: CLVPDiscardCheckoutItem,
                EnqueueEcbInfoRequest: CLVPEnqueueEcbInfoRequest,
                EnsureChangeContext: CLVPEnsureChangeContext,
                EnsureEcbInfo: CLVPEnsureEcbInfo,
                FilterString: CLVPFilterString,
                FindWebPartDiv: CLVPFindWebPartDiv,
                GetEcbInfo: CLVPGetEcbInfo,
                GetQueryString: CLVPGetQueryString,
                Init: CLVPInit,
                InplViewUrl: CLVPInplViewUrl,
                ModerateItem: CLVPModerateItem,
                RefreshInplViewUrl: CLVPRefreshInplViewUrl,
                InplViewUrlTrim: CLVPInplViewUrlTrim,
                InplViewUrlHash: CLVPInplViewUrlHash,
                InvalidateEcbInfo: CLVPInvalidateEcbInfo,
                IsInGroupCache: CLVPIsInGroupCache,
                ManageCopies: CLVPManageCopies,
                NoOutstandingECBRequests: CLVPNoOutstandingECBRequests,
                PagingString: CLVPPagingString,
                RefreshCore: CLVPRefreshCore,
                RefreshCurrent: CLVPRefreshCurrent,
                RefreshEcbInfo: CLVPRefreshEcbInfo,
                RefreshPaging: CLVPRefreshPaging,
                RefreshPagingEx: CLVPRefreshPagingEx,
                RehookPaging: CLVPRehookPaging,
                ResetSelection: CLVPResetSelection,
                ShowErrorDialog: CLVPShowErrorDialog,
                ShowPopup: CLVPShowPopup,
                SyncPagingTables: CLVPSyncPagingTables,
                WebPartId: CLVPWebPartId,
                RestoreNavigation: CLVPRestoreNavigation,
                GetQueryStringFromHash: CLVPGetQueryStringFromHash,
                FindTab: CLVPFindTab
            };
        }
        CLVP_InitializePrototype();
        function CLVP(ctxParam) {
            this.ctx = ctxParam;
            ctxParam.clvp = this;
        }
        function CLVPInit() {
            var div = this.FindTab();

            if (div == null)
                return;
            this.wpq = div.id;
            this.pagingTab = document.getElementById("bottomPagingCell" + this.wpq.substr(7));
            if (this.tab != null && this.tab.className == "ms-emptyView") {
                var tr = DOM_afterglass.GetAncestor(this.tab, "TR");

                this.trEmpty = tr.nextSibling;
            }
            if (this.ctx.rootFolder != null)
                this.rootFolder = URI.decodeURIComponent(this.ctx.rootFolder);
            if (!Boolean(this.rootFolder))
                this.rootFolder = Nav.getUrlKeyValue("RootFolder");
            if (this.rootFolder.length == 0)
                this.rootFolder = null;
            var hashStr = this.GetQueryStringFromHash();

            if (!TypeUtil.IsNullOrUndefined(hashStr))
                this.ctx.queryString = hashStr;
        }
        function CLVPFindTab() {
            var isDoclib = this.ctx.listBaseType == 1;
            var tabId = this.ctx.listName + "-" + this.ctx.view;
            var tabs = DOM.GetElementsByName(tabId);

            if (tabs.length == 0 && isDoclib) {
                tabId = "onetidDoclibViewTbl0";
                tabs = DOM.GetElementsByName(tabId);
            }
            var div = null;

            if (tabs.length == 0 && !isDoclib) {
                tabs = DOM.GetElementsByName("onetidDoclibViewTbl0");
            }
            if (tabs.length == 0)
                tabs = DOM.GetElementsByName("onetidDoclibViewTbl" + this.ctx.ctxId);
            var i;

            for (i = 0; i < tabs.length; i++) {
                var tab = tabs[i];

                div = tab;
                var wpid = null;

                while (div != null && (div.tagName != "DIV" || (wpid = div.getAttribute("WebPartID")) == null) && div.parentNode != null) {
                    div = div.parentNode;
                }
                if (div != null) {
                    if (wpid != null && this.ctx.view.indexOf(wpid.toUpperCase()) == 1) {
                        this.tab = tab;
                        this.wpq = div.id;
                        break;
                    }
                }
            }
            if (div == null || this.tab == null) {
                return null;
            }
            this.tab.clvp = this;
            return div;
        }
        function CLVPFindWebPartDiv(tab) {
            var div = tab;

            while (div != null && div.tagName != "DIV") {
                div = div.parentNode;
            }
            return div;
        }
        function CLVPRestoreNavigation() {
            var strHash = '';

            if (!CompareUrls(this.strHash, strHash)) {
                var strInpl = '?' + DecodeHashAsQueryString(strHash);

                this.strHash = strHash;
                this.fRestore = true;
                var curRootFolder = ListModule.Util.getRootFolder2(this);

                if (curRootFolder != null)
                    strInpl = SetUrlKeyValue("RootFolder", URI.decodeURIComponent(curRootFolder), true, strInpl);
                this.RefreshPagingEx(strInpl, true, null);
            }
        }
        function CLVPGetQueryStringFromHash() {
            return '';
        }
        function CLVPSyncPagingTables() {
            if (this.wpq == null)
                return;
            var tab = this.pagingTab;
            var topTab = document.getElementById("topPagingCell" + this.wpq.substr(7));

            if (tab == null) {
                if (topTab != null) {
                    topTab.style.display = "none";
                }
                return;
            }
            if (topTab != null) {
                topTab.style.display = "";
                if (DOM.GetInnerText(topTab) != DOM.GetInnerText(tab))
                    topTab.innerHTML = tab.innerHTML;
                var lnksTop = topTab.getElementsByTagName("A");
                var lnks = tab.getElementsByTagName("A");
                var i = 0;

                for (i = 0; i < lnks.length; i++) {
                    lnksTop[i].onclick = lnks[i].onclick;
                }
            }
        }
        function CLVPRehookPaging(tBody) {
            if (typeof this.ctx.noAJAX != "undefined" && this.ctx.noAJAX) {
                return;
            }
            var tab = this.pagingTab;

            if (tab == null) {
                this.SyncPagingTables();
                return;
            }
            var lnks = tab.getElementsByTagName("A");
            var i;

            for (i = 0; i < lnks.length; i++) {
                var lnk = lnks[i];
                var str = typeof lnk.onclick != "undefined" ? String(lnk.onclick) : "";
                var separator = '"';

                str = str.substr(str.indexOf(separator) + 1);
                str = str.substr(0, str.indexOf(separator));
                if (tBody != null)
                    str += "&IsGroupRender=TRUE";
                var clvp = this;
                var tBodyId;
                var strHref;

                if (tBody != null)
                    tBodyId = tBody.id;
                else
                    tBodyId = null;
                strHref = str;
                if (typeof tBodyId != "undefined" && typeof strHref != "undefined")
                    UpdateOnClick(lnk, clvp, strHref, tBodyId);
            }
            if (tBody == null)
                this.SyncPagingTables();
            function UpdateOnClick(elem, clvpParam, addr, bodyId) {
                elem.onclick = function() {
                    clvpParam.RefreshPaging(addr, bodyId);
                    return false;
                };
            }
        }
        function CLVPFilterString() {
            return this.PagingString(["Filter", "Sort"]);
        }
        function CLVPPagingString(keyWhitelist) {
            if (this.rgpaging == null)
                return null;
            var key;
            var val;
            var rg = [];
            var isFirst = true;

            for (key in this.rgpaging) {
                var match = false;

                if (keyWhitelist == null) {
                    match = true;
                }
                else {
                    for (var whitelistedKey in keyWhitelist) {
                        if (key.indexOf(whitelistedKey) == 0) {
                            match = true;
                            break;
                        }
                    }
                }
                if (match) {
                    if (isFirst)
                        isFirst = false;
                    else
                        rg.push("&");
                    rg.push(key);
                    rg.push("=");
                    rg.push(this.rgpaging[key]);
                }
            }
            return rg.join("");
        }
        function CLVPRefreshPaging(strUrl, tBodyIdParam, fetchUrl) {
            if (tBodyIdParam != null) {
                this.tBody = document.getElementById(tBodyIdParam);
            }
            return this.RefreshPagingEx(strUrl, true, null, fetchUrl);
        }
        function RefreshPageToEx(evt, url, bForceSubmit) {
            var clvp = CLVPFromEventReal(evt);

            if (clvp != null && clvp.ctx.IsClientRendering) {
                clvp.RefreshPaging(url);
                clvp.ctx.queryString = url;
                if ((typeof clvp.ctx.operationType == "undefined" || clvp.ctx.operationType == SPListOperationType.Default) && Boolean(clvp.ctx.ListData)) {
                    var fromPage = clvp.ctx.ListData.FirstRow - 1;
                    var toPage = Number(Nav.getUrlKeyValue("PageFirstRow", false, url));

                    if (!isNaN(fromPage) && !isNaN(toPage) && fromPage != toPage)
                        fromPage < toPage ? (clvp.ctx.operationType = SPListOperationType.PagingRight) : (clvp.ctx.operationType = SPListOperationType.PagingLeft);
                }
            }
            else {
                (function() {
                    if (!false) {
                        if (confirm("Assertion failed: " + "standalone view does not support refresh via form post" + ". Break into debugger?"))
                            eval("debugger");
                    }
                })();
                ;
            }
        }
        function CLVPRefreshPagingEx(strUrl, fResetPaging, cmd, fetchUrl) {
            var isFirstRow = Nav.getUrlKeyValue("PageFirstRow", false, strUrl) == "1";

            if (isFirstRow)
                strUrl = ListModule.Util.removeOnlyPagingArgs(strUrl);
            var uri = new URI(strUrl, {
                disableEncodingDecodingForLegacyCode: true
            });
            var strQuery = uri.getQuery();
            var rgparams = strQuery.split("&");
            var i;
            var rg = [];

            if (cmd != null)
                rg.push("&Cmd=" + cmd);
            if (this.ctx.HasRelatedCascadeLists == 1 && this.ctx.CascadeDeleteWarningMessage == null) {
                rg.push("&CascDelWarnMessage=1");
            }
            if (fResetPaging || typeof this.rgpaging == "undefined" || this.rgpaging == null) {
                this.rgpaging = [];
                for (i = 0; i < rgparams.length; i++) {
                    var rgp = rgparams[i].split("=");

                    if (rgp[0] == "List" || rgp[0] == "View" || rgp[0] == "ID") {
                        delete rgp;
                        continue;
                    }
                    if (rgp.length > 1)
                        this.rgpaging[rgp[0]] = rgp[1];
                    delete rgp;
                    rg.push("&");
                    rg.push(rgparams[i]);
                }
            }
            else {
                var key;

                for (key in this.rgpaging) {
                    if (key == "List" || key == "View" || key == "ID")
                        continue;
                    rg.push("&");
                    rg.push(key);
                    rg.push("=");
                    rg.push(this.rgpaging[key]);
                }
            }
            var hidGrpBy = document.getElementById("GroupByWebPartID" + this.ctx.ctxId);

            if (hidGrpBy != null)
                rg.push("&WebPartID=" + hidGrpBy.getAttribute("webPartID"));
            if (this.strGroupName != null) {
                var strGroupString = ListModule.Util.groupStringFromGroupName(this.strGroupName);

                if (strGroupString != null) {
                    rg.push("&IsGroupRender=TRUE&DrillDown=1&GroupString=" + strGroupString);
                }
            }
            var inplViewUrl = new URI(this.InplViewUrl(), {
                disableEncodingDecodingForLegacyCode: true
            });
            var inplPath = inplViewUrl.getStringWithoutQueryAndFragment();
            var inplQuery = inplViewUrl.getQuery();
            var strNewParams = rg.join("");

            delete rg;
            var strInpl = inplPath + "?" + ListModule.Util.reconcileQstringFilters(inplQuery, strNewParams);

            if ((Nav.getUrlKeyValue("SortField", true, strInpl)).length == 0) {
                var strSortField = Nav.getUrlKeyValue("SortField", true, window.location.href);

                if (strSortField.length > 0)
                    strInpl = SetUrlKeyValue("SortField", strSortField, false, strInpl);
                var strSortDir = Nav.getUrlKeyValue("SortDir", true, window.location.href);

                if (strSortDir.length > 0)
                    strInpl = SetUrlKeyValue("SortDir", strSortDir, false, strInpl);
            }
            var strRoot = Nav.getUrlKeyValue("RootFolder", true, strUrl);

            if (strRoot.length > 0 && (Nav.getUrlKeyValue("RootFolder", true, strInpl)).length == 0)
                strInpl = SetUrlKeyValue("RootFolder", strRoot, false, strInpl);
            var strShowInGrid = Nav.getUrlKeyValue("ShowInGrid", true, strInpl);

            if (strShowInGrid == "True" && !this.ctx.inGridMode) {
                strInpl = SetUrlKeyValue("ShowInGrid", "False", true, strInpl);
            }
            else if (strShowInGrid != "True" && this.ctx.inGridMode) {
                strInpl = SetUrlKeyValue("ShowInGrid", "True", true, strInpl);
            }
            if (fetchUrl)
                return strInpl;
            this.RefreshCore(strInpl);
            return undefined;
        }
        function CLVPResetSelection() {
            var ctxCur = this.ctx;
            var bNeedRefresh = true;

            this.CUIItemInfo = null;
            if (ListModule.Util.countSelectedItems(ctxCur) > 0) {
                var dictLocal = ctxCur.dictSel;

                ctxCur.dictSel = [];
                ctxCur.CurrentSelectedItems = 0;
                var cUrl = window.location.href;

                if (cUrl.indexOf("Filter") == -1 && cUrl.indexOf("Sort") == -1) {
                    var tab = this.tab;

                    if (tab != null) {
                        var rows = tab.rows;
                        var ReselectRow = function(oneRow) {
                            var iidLocal = oneRow.getAttribute("iid");

                            return iidLocal != null && dictLocal[iidLocal] != null;
                        };
                        var lastIdx = ListModule.Util.getLastSelectableRowIdx(tab, ReselectRow);

                        if (rows != null && lastIdx > 0) {
                            var i;

                            for (i = 0; i < lastIdx; i++) {
                                var r = rows[i];
                                var iid = r.getAttribute("iid");

                                if (iid != null && dictLocal[iid] != null)
                                    ListModule.Util.toggleItemRowSelection2(ctxCur, r, true, false, false);
                            }
                            bNeedRefresh = false;
                            ListModule.Util.toggleItemRowSelection2(ctxCur, rows[lastIdx], true, true, false);
                        }
                    }
                }
            }
            ListModule.Util.updateSelectAllCbx(ctxCur, true);
        }
        function CLVPWebPartId() {
            if (this.wpid == null) {
                if (this.tab != null) {
                    var div = this.tab;

                    while (div != null && div.tagName != "DIV") {
                        div = div.parentNode;
                    }
                    if (div != null) {
                        if (div.getAttribute("WebPartID2") != null) {
                            this.wpid = div.getAttribute("WebPartID2");
                            return this.wpid;
                        }
                        if (div.getAttribute("WebPartID") != null) {
                            this.wpid = div.getAttribute("WebPartID");
                            return this.wpid;
                        }
                    }
                }
                this.wpid = (this.ctx.view.toLowerCase()).substring(1, this.ctx.view.length - 1);
            }
            return this.wpid;
        }
        function FixAggregate(renderCtx, listData, listSchema) {
            if (listData == null || listSchema == null)
                return;
            var aggregate = listSchema.Aggregate;

            if (aggregate != null && listData.Row.length > 0 && !listSchema.groupRender && !renderCtx.inGridMode) {
                var oldAggregateNode = document.getElementById("aggr" + renderCtx.wpq);
                var newAggregateStr = "<table>" + RenderAggregate(renderCtx, null, listData.Row[0], listSchema, null, true, aggregate) + "</table>";
                var scriptNode = document.getElementById("scriptBody" + renderCtx.wpq);
                var container = document.createElement("div");

                container.innerHTML = newAggregateStr;
                var newAggregateNode = container.firstChild.firstChild;

                oldAggregateNode.replaceChild(newAggregateNode.firstChild, oldAggregateNode.firstChild);
            }
        }
        function FixSortOrderIcon(renderCtx, listData, listSchema) {
            if (renderCtx == null || listData == null || listSchema == null)
                return;
            if (renderCtx.IsClientRendering) {
                var sortArrowSpan;

                if (listData.SortField != null) {
                    sortArrowSpan = document.getElementById("diidSortArrowSpan" + renderCtx.ctxId + listData.SortField);
                    if (sortArrowSpan != null) {
                        var sortArrowImg = (sortArrowSpan.getElementsByTagName("img"))[0];

                        if (sortArrowImg != null) {
                            if (listData.SortDir == "ascending") {
                                sortArrowSpan.className = "ms-sortarrowup-iconouter";
                                sortArrowImg.className = "ms-sortarrowup-icon";
                            }
                            else {
                                sortArrowSpan.className = "ms-sortarrowdown-iconouter";
                                sortArrowImg.className = "ms-sortarrowdown-icon";
                            }
                            sortArrowSpan.style.display = "";
                        }
                    }
                }
                var bShowFilterIcon;
                var filterSpan;

                for (var idx in listSchema.Field) {
                    var field = listSchema.Field[idx];

                    if (field.GroupField != null)
                        continue;
                    if (field.Name != listData.SortField) {
                        sortArrowSpan = document.getElementById("diidSortArrowSpan" + renderCtx.ctxId + field.Name);
                        if (sortArrowSpan != null) {
                            sortArrowSpan.style.display = "none";
                        }
                    }
                    filterSpan = document.getElementById("diidFilterSpan" + renderCtx.ctxId + field.Name);
                    if (filterSpan != null) {
                        bShowFilterIcon = listData.FilterFields != null && listData.FilterFields.indexOf(';' + field.Name + ';') >= 0;
                        filterSpan.style.display = bShowFilterIcon ? "" : "none";
                    }
                }
            }
            else {
                FixSortOrderIcon_NonCSR(renderCtx, listData, listSchema);
            }
        }
        function FixSortOrderIcon_NonCSR(renderCtx, listData, listSchema) {
            var sortGif = '/_layouts/15/images/sort.gif';
            var rsortGif = '/_layouts/15/images/rsort.gif';

            if (listData == null || listSchema == null)
                return;
            if (listData.SortField != null) {
                var sortNode = document.getElementById("diidSort" + renderCtx.ctxId + listData.SortField);

                if (sortNode != null) {
                    var lastNode = sortNode.lastChild;

                    if (lastNode != null) {
                        var imgNode = lastNode.previousSibling;

                        if (imgNode != null && imgNode.tagName == "IMG" && (imgNode.src.substr(imgNode.src.length - sortGif.length) == sortGif || imgNode.src.substr(imgNode.src.length - rsortGif.length) == rsortGif))
                            imgNode.parentNode.removeChild(imgNode);
                        var img = document.createElement("IMG");

                        img.border = 0;
                        if (listData.SortDir == "ascending") {
                            img.alt = GetString("L_viewedit_onetidSortAsc");
                            img.src = "/_layouts/15/images/sort.gif?rev=33";
                        }
                        else {
                            img.alt = GetString("L_viewedit_onetidSortDesc");
                            img.src = "/_layouts/15/images/rsort.gif?rev=33";
                        }
                        if (lastNode.tagName != "IMG") {
                            var blankImg = document.createElement("IMG");

                            blankImg.border = 0;
                            blankImg.src = '/_layouts/15/images/blank.gif';
                            lastNode = sortNode.appendChild(blankImg);
                        }
                        sortNode.insertBefore(img, lastNode);
                    }
                }
            }
            for (var idx in listSchema.Field) {
                var field = listSchema.Field[idx];

                if (field.GroupField != null)
                    continue;
                sortNode = document.getElementById("diidSort" + renderCtx.ctxId + field.Name);
                if (field.Name != listData.SortField) {
                    if (sortNode != null) {
                        lastNode = sortNode.lastChild;
                        if (lastNode != null) {
                            imgNode = lastNode.previousSibling;
                            if (imgNode != null && imgNode.tagName == "IMG" && (imgNode.src.substr(imgNode.src.length - sortGif.length) == sortGif || imgNode.src.substr(imgNode.src.length - rsortGif.length) == rsortGif))
                                imgNode.parentNode.removeChild(imgNode);
                        }
                    }
                }
                if (sortNode != null) {
                    var filterNode = sortNode.nextSibling;

                    if (filterNode == null) {
                        filterNode = document.createElement("IMG");
                        filterNode.border = 0;
                        sortNode.parentNode.appendChild(filterNode);
                    }
                    var bShowFilterIcon = listData.FilterFields != null && listData.FilterFields.indexOf(';' + field.Name + ';') >= 0;

                    if (bShowFilterIcon)
                        filterNode.src = '/_layouts/15/images/filter.gif';
                    else
                        filterNode.src = '/_layouts/15/images/blank.gif';
                }
            }
        }
        function CLVPCancelAnyOutstandingRequest() {
            var clvp = this;

            if (clvp.bRequestOutstanding && clvp.outstandingRequest != undefined) {
                if (clvp.isEcbInfo) {
                    clvp.isEcbInfo = false;
                    clvp.strGroupName = null;
                }
                clvp.outstandingRequest.isCancelled = true;
                clvp.outstandingRequest = undefined;
            }
            return false;
        }
        function EnableListAnimation(rCtx) {
            return false;
        }
        function ReRenderListView(rCtx, strUrl, req) {
            var clvp = rCtx.clvp;
            var fListCSRAnimationEnabled = EnableListAnimation(rCtx);
            var fOldFooter = false;
            var fNewFooter = false;

            if (fListCSRAnimationEnabled)
                fOldFooter = rCtx.ListData.Row.length == 0 || Boolean(rCtx.ListData.NextHref);
            if (req != null) {
                rCtx.ListData = JSON.parse(req.responseText);
            }
            if (fListCSRAnimationEnabled)
                fNewFooter = rCtx.ListData.Row.length == 0 || Boolean(rCtx.ListData.NextHref);
            var fRenderHiddenFooter = fListCSRAnimationEnabled && fNewFooter && !fOldFooter;
            var templateBody = null;

            if (!(clvp != null && clvp.fRestore || rCtx.enteringGridMode || rCtx.leavingGridMode))
                templateBody = document.getElementById('scriptBody' + rCtx.wpq);
            RenderListView(rCtx, rCtx.wpq, templateBody, fListCSRAnimationEnabled, fRenderHiddenFooter);
            FixSortOrderIcon(rCtx, rCtx.ListData, rCtx.ListSchema);
            FixAggregate(rCtx, rCtx.ListData, rCtx.ListSchema);
            if (clvp == null) {
                clvp = new CLVP(rCtx);
                rCtx.clvp = clvp;
            }
            if (clvp.tab == null)
                clvp.Init();
            else if (templateBody == null)
                clvp.FindTab();
            if (clvp.fRestore || rCtx.enteringGridMode || rCtx.leavingGridMode) {
                clvp.fRestore = false;
                if (clvp.tab != null)
                    CSSUtil.RemoveClass(clvp.tab, 's4-hide-tr');
            }
            if (!Boolean(clvp.ctx.loadingAsyncData) && !clvp.fRestore && req != null || clvp.ctx.enteringGridMode || clvp.ctx.leavingGridMode) {
                var parts = {};
                var strHash = clvp.InplViewUrlHash(strUrl);

                parts["InplviewHash" + clvp.WebPartId()] = strHash;
                clvp.strHash = strHash;
            }
            if (Boolean(clvp.ctx.loadingAsyncData))
                clvp.ctx.loadingAsyncData = false;
            ListModule.Util.ctxInitItemState(rCtx);
            ListModule.Util.clearSelectedItemsDict(rCtx);
            if (clvp.tab != null && (typeof clvp.tab.onmouseover == 'undefined' || clvp.tab.onmouseover == null))
                clvp.tab.onmouseover = clvp.ctx.TableMouseoverHandler;
            if (rCtx.SelectAllCbx != null && (typeof rCtx.SelectAllCbx.onfocus == 'undefined' || rCtx.SelectAllCbx.onfocus == null))
                rCtx.SelectAllCbx.onfocus = rCtx.TableCbxFocusHandler;
            clvp.InvalidateEcbInfo();
            clvp.ResetSelection();
            clvp.SyncPagingTables();
            if (typeof clvp.ctx.onViewReRenderCompleted == 'function') {
                var callback = clvp.ctx.onViewReRenderCompleted;

                clvp.ctx.onViewReRenderCompleted = null;
                if (callback != null) {
                    callback(clvp.ctx);
                }
            }
            rCtx.operationType = SPListOperationType.Default;
            if (rCtx.leavingGridMode) {
                rCtx.leavingGridMode = false;
            }
        }
        function CLVPRefreshCore(strUrl, responseHandler) {
            var req = new this.xmlHttpCtr;
            var additionalPostData = "";

            if (typeof this.ctx.overrideSelectCommand != "undefined") {
                additionalPostData = "&OverrideSelectCommand=" + this.ctx.overrideSelectCommand;
                strUrl = SetUrlKeyValue("IgnoreQString", "TRUE", false, strUrl);
            }
            var strRootFolder = Nav.getUrlKeyValue("RootFolder", true, strUrl);

            if (strRootFolder.length > 0) {
                additionalPostData = additionalPostData + "&InplRootFolder=" + strRootFolder;
                strUrl = URI.removeKeyValue("RootFolder", strUrl);
            }
            req.open("POST", strUrl, true);
            req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            var clvp = this;
            var groupBody = clvp.tBody;

            clvp.tBody = null;
            clvp.focusInfo = null;
            clvp.CancelAnyOutstandingRequest();
            if (focusAcc != null && focusAcc.focusInCLVPTab != null)
                clvp.focusInfo = focusAcc;
            if (clvp.ctx.enteringGridMode && !clvp.fRestore) {
                ReRenderListView(clvp.ctx, strUrl, null);
                return;
            }
            clvp.outstandingRequest = req;
            clvp.bRequestOutstanding = true;
            req.onreadystatechange = function() {
                var i;
                var callback = null;

                if (req.readyState == 4 && typeof clvp.ctx.onDataRefreshCompleted == 'function') {
                    callback = clvp.ctx.onDataRefreshCompleted;
                    clvp.ctx.onDataRefreshCompleted = null;
                }
                if ((typeof req.isCancelled == 'undefined' || req.isCancelled != true) && req.readyState == 4) {
                    if (callback != null)
                        callback(clvp.ctx);
                    try {
                        req.onreadystatechange = null;
                    }
                    catch (e) { }
                    clvp.bRequestOutstanding = false;
                    var reqStatus = 0;

                    try {
                        reqStatus = req.status;
                    }
                    catch (e) { }
                    if (reqStatus == 0)
                        return;
                    var strInner = req.responseText;
                    var uri = Boolean(clvp.ctx.queryString) ? new URI(clvp.ctx.queryString, {
                        disableEncodingDecodingForLegacyCode: true
                    }) : null;

                    if (uri !== null && uri.getQuery() !== "") {
                        var SaveThisViewButton = document.getElementById("CSRSaveAsNewViewDiv" + clvp.ctx.wpq);

                        if (Boolean(SaveThisViewButton))
                            SaveThisViewButton.style.visibility = "visible";
                    }
                    if (reqStatus == 601) {
                        if (typeof clvp.ctx.onRefreshFailed == 'function') {
                            clvp.ctx.onRefreshFailed(clvp.ctx, req);
                            clvp.ctx.onRefreshFailed = null;
                        }
                        else {
                            alert(strInner);
                        }
                        return;
                    }
                    if (typeof responseHandler === 'function') {
                        responseHandler(strUrl, req.responseText);
                        return;
                    }
                    if (clvp.isEcbInfo) {
                        clvp.CacheEcbInfo(strInner);
                        clvp.isEcbInfo = false;
                        clvp.strGroupName = null;
                        if (clvp.queueEcbInfo.length > 0) {
                            while (clvp.EnsureEcbInfo(null, null, clvp.queueEcbInfo.shift()) != null && clvp.queueEcbInfo.length > 0) { }
                        }
                        return;
                    }
                    var oldListData = null;

                    if (groupBody == null && clvp.ctx.IsClientRendering) {
                        var rCtx = clvp.ctx;

                        ReRenderListView(rCtx, strUrl, req);
                        return;
                    }
                    else if (groupBody != null && clvp.ctx.IsClientRendering) {
                        rCtx = clvp.ctx;
                        oldListData = rCtx.ListData;
                        rCtx.ListData = JSON.parse(req.responseText);
                        var listSchema = rCtx.ListSchema;
                        var group1 = listSchema.group1;
                        var group2 = listSchema.group2;
                        var collapse = listSchema.Collapse;

                        listSchema.groupRender = true;
                        listSchema.group1 = null;
                        listSchema.group2 = null;
                        listSchema.Collapse = null;
                        var oldHeaderTemplate = rCtx.Templates.Header;

                        rCtx.Templates.Header = '';
                        SPClientRenderer._ExecuteRenderCallbacks(rCtx, 'OnPreRender');
                        strInner = SPClientRenderer.RenderCore(rCtx);
                        if (rCtx.Templates.Footer == '')
                            rCtx.Templates.Footer = RenderFooterTemplate;
                        strInner += rCtx.RenderFooter(rCtx);
                        rCtx.Templates.Header = oldHeaderTemplate;
                        listSchema.group1 = group1;
                        listSchema.group2 = group2;
                        listSchema.Collapse = collapse;
                        listSchema.groupRender = null;
                        if (typeof m$ != "undefined")
                            rCtx.ListData = MergeListData(oldListData, rCtx.ListData);
                    }
                    var div = document.createElement("DIV");
                    var tid = clvp.tab.id;

                    if (clvp.tab.tagName == "DIV" && typeof clvp.tab.tabid != "undefined")
                        tid = clvp.tab.tabid;
                    var pid = Boolean(clvp.pagingTab) ? clvp.pagingTab.id : null;

                    div.style.visibility = "hidden";
                    div.innerHTML = strInner;
                    var oldFilterIfrm = document.getElementById("FilterIframe" + clvp.ctx.ctxId);
                    var newIfrms = div.getElementsByTagName("IFRAME");
                    var idx;
                    var newFilterIfrm = null;

                    for (idx = 0; idx < newIfrms.length; idx++) {
                        if (newIfrms[idx].id == "FilterIframe" + clvp.ctx.ctxId) {
                            newFilterIfrm = newIfrms[idx];
                            break;
                        }
                    }
                    if (oldFilterIfrm != null && newFilterIfrm != null) {
                        var td = oldFilterIfrm.parentNode;

                        td.removeChild(oldFilterIfrm);
                        td.appendChild(newFilterIfrm);
                    }
                    document.body.appendChild(div);
                    var evalSafeClvp = clvp;

                    eval("ctx" + clvp.ctx.ctxId + ".clvp = evalSafeClvp;");
                    var rgscripts = ExpColGroupScripts(strInner);
                    var ppid = 'previewpanetable' + clvp.ctx.ctxId;
                    var ppold = document.getElementById(ppid);

                    if (ppold != null)
                        ppold.id = '';
                    clvp.tab.id = "";
                    var hid = document.getElementById("hidRootFolder");

                    if (hid != null) {
                        clvp.rootFolder = hid.value;
                        if (hid.value.indexOf('?') >= 0)
                            debugger;
                    }
                    var hidFolderGuid = document.getElementById("hidRootFolderGuid");

                    if (hidFolderGuid != null)
                        clvp.rootFolderGuid = hidFolderGuid.value;
                    var tabs;

                    if (groupBody != null && clvp.ctx.IsClientRendering)
                        tabs = div.childNodes;
                    else
                        tabs = DOM.GetElementsByName(tid);
                    if (tabs.length == 0) {
                        if (tid == "onetidDoclibViewTbl0")
                            tabs = DOM.GetElementsByName(clvp.ctx.listName + "-" + clvp.ctx.view);
                        else
                            tabs = DOM.GetElementsByName("onetidDoclibViewTbl0");
                    }
                    var tabNew = null;
                    var pagNew = document.getElementById("bottomPagingCell");
                    var trNew = null;

                    if (tabs.length == 1)
                        tabNew = tabs[0];
                    else {
                        for (i = 0; i < tabs.length; i++) {
                            tabNew = tabs[i];
                            var divNew = clvp.FindWebPartDiv(tabNew);

                            if (divNew == div)
                                break;
                        }
                        if (i == tabs.length)
                            tabNew = null;
                    }
                    if (tabNew == null) {
                        SwapNode(clvp.tab, div);
                        div.style.visibility = "visible";
                        return;
                    }
                    if (tabNew.className == "ms-emptyView") {
                        trNew = DOM_afterglass.GetAncestor(tabNew, "TR");
                        trNew = trNew.nextSibling;
                    }
                    var groupRender = false;

                    if (groupBody != null) {
                        groupRender = true;
                        if (groupBody.getAttribute("isLoaded") != null) {
                            groupBody.setAttribute("isLoaded", "true");
                            clvp.tab.id = tid;
                            if (typeof clvp.tab.onmouseover == 'undefined' || clvp.tab.onmouseover == null)
                                clvp.tab.onmouseover = clvp.ctx.TableMouseoverHandler;
                            if (clvp.ctx.SelectAllCbx != null && (typeof clvp.ctx.SelectAllCbx.onfocus == 'undefined' || clvp.ctx.SelectAllCbx.onfocus == null))
                                clvp.ctx.SelectAllCbx.onfocus = clvp.ctx.TableCbxFocusHandler;
                            if (!clvp.ctx.StateInitDone)
                                ListModule.Util.ctxInitItemState(clvp.ctx);
                            var objChildren = groupBody.childNodes;

                            for (i = objChildren.length - 1; i >= 0; i--) {
                                var objToRemove = objChildren[i];

                                if (objToRemove.tagName == "TR" && ListModule.Util.itemIsSelectable(objToRemove))
                                    clvp.ctx.TotalListItems--;
                                groupBody.removeChild(objToRemove);
                            }
                            var selectableNodes = 0;
                            var tBodyArray = tabNew.getElementsByTagName("TBODY");

                            if (tBodyArray.length >= 1) {
                                objChildren = tBodyArray[0].childNodes;
                                var node = null;

                                for (i = objChildren.length - 1; i >= 0; i--) {
                                    var objToInsert = objChildren[i];

                                    if (i == 0 && objToInsert.className.startsWith("ms-viewheadertr"))
                                        continue;
                                    if (objToInsert.tagName == "TR" && ListModule.Util.itemIsSelectable(objToInsert)) {
                                        selectableNodes++;
                                        clvp.ctx.TotalListItems++;
                                    }
                                    node = groupBody.insertBefore(objToInsert, node);
                                }
                                if (pagNew != null) {
                                    var pagingTable = DOM_afterglass.GetAncestor(pagNew, "TABLE");
                                    var curPagTab = groupBody.nextSibling;

                                    if (curPagTab == null || curPagTab.tagName != "TBODY" || curPagTab.id != groupBody.id + "page" || curPagTab.firstChild == null || curPagTab.firstChild.tagName != "TR") {
                                        curPagTab = document.createElement("TBODY");
                                        curPagTab.id = groupBody.id + "page";
                                        curPagTab = groupBody.parentNode.insertBefore(curPagTab, groupBody.nextSibling);
                                        var tr = document.createElement("TR");

                                        tr = curPagTab.appendChild(tr);
                                    }
                                    var trNode = curPagTab.firstChild;

                                    if (trNode.firstChild != null)
                                        trNode.removeChild(trNode.firstChild);
                                    pagNew.colSpan = 100;
                                    pagNew.id = pagNew.id + clvp.wpq.substr(7) + groupBody.id;
                                    pagNew = trNode.appendChild(pagNew);
                                }
                                groupBody.setAttribute("selectableRows", String(selectableNodes));
                            }
                            clvp.InvalidateEcbInfo();
                            clvp.ResetSelection();
                        }
                    }
                    document.body.removeChild(div);
                    if (pagNew != null) {
                        var tab = clvp.pagingTab;

                        clvp.pagingTab = pagNew;
                        clvp.RehookPaging(groupBody);
                        clvp.pagingTab = tab;
                    }
                    if (groupRender) {
                        (function() {
                            if (!false) {
                                if (confirm("Assertion failed: " + "standalone view does not support group rendering" + ". Break into debugger?"))
                                    eval("debugger");
                            }
                        })();
                        ;
                    }
                    if (clvp.queueEcbInfo.length > 0) {
                        clvp.EnsureEcbInfo(null, null, clvp.queueEcbInfo.shift());
                    }
                    if (clvp != null && clvp.focusInfo != null) {
                        if (clvp.focusInfo.focusInCLVPTab != null && clvp.focusInfo.focusInCLVPTab == true) {
                            var focusTabl = clvp.tab;
                            var focusBack = null;

                            if (focusTabl != null && clvp.focusInfo.tagName != null && clvp.focusInfo.id != null) {
                                var focusArray = focusTabl.getElementsByTagName(clvp.focusInfo.tagName);

                                for (i = 0; i < focusArray.length; i++) {
                                    if (focusArray[i].id == clvp.focusInfo.id) {
                                        focusBack = focusArray[i];
                                        break;
                                    }
                                }
                            }
                            if (focusBack != null && focusBack.tagName != "A") {
                                var anchorList = focusBack.getElementsByTagName("A");
                                var anchorListLen = anchorList.length;

                                if (anchorListLen > 0)
                                    focusBack = anchorList[anchorListLen - 1];
                            }
                            if (focusBack != null) {
                                if (typeof focusBack.setActive != 'undefined' && focusBack.setActive != null)
                                    focusBack.setActive();
                                else if (focusBack.focus != null)
                                    focusBack.focus();
                            }
                            focusAcc = null;
                        }
                    }
                    if (groupBody != null && clvp.ctx.IsClientRendering)
                        SPClientRenderer._ExecuteRenderCallbacks(rCtx, 'OnPostRender');
                }
            };
            var sendRequest = function() {
                req.send(additionalPostData);
            };

            if (clvp.ctx.inGridMode && !clvp.ctx.enteringGridMode && !clvp.isEcbInfo) {
                (function() {
                    if (!false) {
                        if (confirm("Assertion failed: " + "grid mode not (yet) supported in standalone view." + ". Break into debugger?"))
                            eval("debugger");
                    }
                })();
                ;
                return;
            }
            sendRequest();
        }
        var SPListOperationType = {
            Default: 0,
            Sort: 1,
            PagingRight: 2,
            PagingLeft: 3
        };

        function AnimateListDelta(context, table) {
            var contextId = context.ctxId;
            var tbodies = FetchTableBodies(table);
            var oldtbody = tbodies.oldbody;
            var newtbody = tbodies.newbody;
            var footerTable = document.getElementById("scriptPaging" + context.wpq);

            if (oldtbody == null && newtbody == null)
                return;
            if (context.operationType == SPListOperationType.PagingRight || context.operationType == SPListOperationType.PagingLeft) {
                FixupTable(oldtbody, newtbody, footerTable, contextId);
            }
            else {
                FixupTable(oldtbody, newtbody, footerTable, contextId);
            }
            return;
        }
        function FetchTableBodies(table) {
            var oldtbody = table.firstChild;

            while (oldtbody != null && oldtbody.nodeName != "TBODY")
                oldtbody = oldtbody.nextSibling;
            var newtbody;

            if (oldtbody == null) {
                newtbody = null;
            }
            else if (oldtbody.style.display == "none") {
                newtbody = oldtbody;
                oldtbody = null;
            }
            else {
                newtbody = oldtbody.nextSibling;
            }
            return {
                oldbody: oldtbody,
                newbody: newtbody
            };
        }
        function IsVisible(element) {
            var fHidden = element.offsetWidth == 0 || element.offsetHeight == 0 || element.style.visibility == "hidden";

            return !fHidden;
        }
        function FixupTable(oldTbody, newTbody, footer, contextId) {
            var table = Boolean(oldTbody) ? oldTbody.parentNode : newTbody.parentNode;

            if (table != null && table.nodeName == "TABLE") {
                if (Boolean(oldTbody) && oldTbody.nodeName == "TBODY") {
                    table.removeChild(oldTbody);
                }
                if (Boolean(newTbody) && newTbody.nodeName == "TBODY") {
                    newTbody.style.display = "";
                }
                EnsureSelectionHandler(null, table, contextId);
            }
            if (footer != null && footer.style.display == "none")
                footer.style.display = "";
        }
        function CLVPRefreshCurrent() {
            var url = window.location.href;

            url = FixUrlFromClvp2(this, url, false);
            return this.RefreshPagingEx(url, false, null, true);
        }
        function CLVPGetQueryString() {
            if (this.tab != null && this.tab.getAttribute("FilterLink") != null)
                return this.tab.getAttribute("FilterLink");
            else
                return window.location.href;
        }
        function CLVPRefreshEcbInfo(strGroupName) {
            var url = this.GetQueryString();

            url = FixUrlFromClvp2(this, url, false);
            this.isEcbInfo = true;
            this.strGroupName = strGroupName;
            var clvp = this;

            this.RefreshPagingEx(url, false, "EcbView");
        }
        function CLVPCacheEcbInfo(strHtml) {
            if (this.ctx.HasRelatedCascadeLists == 1 && this.ctx.CascadeDeleteWarningMessage == null) {
                var cdBeginTag = '<CascadeDeleteWarningMessage>';
                var cdEndTag = '</CascadeDeleteWarningMessage>';

                if (strHtml.startsWith(cdBeginTag)) {
                    var idx = strHtml.indexOf(cdEndTag);

                    if (idx !== -1) {
                        this.ctx.CascadeDeleteWarningMessage = strHtml.substring(cdBeginTag.length, idx);
                        strHtml = strHtml.substring(idx + cdEndTag.length);
                    }
                }
            }
            var div = document.createElement("DIV");

            div.innerHTML = strHtml;
            div.style.display = 'none';
            var tbs = div.getElementsByTagName("TABLE");
            var tb;
            var i;
            var tbOriginal = null;

            if (this.strGroupName != null) {
                var oid = "ecbtab_ctx" + this.ctx.ctxId;

                tbOriginal = document.getElementById(oid);
            }
            for (i = 0; i < tbs.length; i++) {
                tb = tbs[i];
                if (this.tab != null && tb.id == this.tab.id) {
                    if (tbOriginal == null)
                        tb.id = "ecbtab_ctx" + this.ctx.ctxId;
                    else
                        tb.id = "ecbtab_ctx" + this.ctx.ctxId + "_" + this.strGroupName;
                    var rows = tb.rows;

                    if (rows.length > 0 && !rows[0].className.indexOf('ms-viewheadertr'))
                        tb.deleteRow(0);
                    tb.style.display = 'none';
                    this.tab.appendChild(tb);
                    var dictLocal;

                    if (tbOriginal == null)
                        dictLocal = [];
                    else
                        dictLocal = typeof tbOriginal.dict == 'undefined' ? undefined : tbOriginal.dict;
                    var ds = tb.getElementsByTagName("DIV");
                    var j;

                    for (j = 0; j < ds.length; j++) {
                        var dLocal = ds[j];

                        if (dLocal.id != "")
                            dictLocal[dLocal.id] = dLocal;
                    }
                    if (tbOriginal == null)
                        tb.dict = dictLocal;
                    if (this.strGroupName != null)
                        this.CacheGroupName(this.strGroupName);
                    break;
                }
            }
            if (this.fnEcbCallback != null && this.queueEcbInfo.length == 0) {
                this.fnEcbCallback();
                this.fnEcbCallback = null;
            }
        }
        function CLVPEnsureEcbInfo(fn, args, strGroupName) {
            var oid = "ecbtab_ctx" + this.ctx.ctxId;
            var o = document.getElementById(oid);

            if (o == null && this.tab != null && this.tab.parentNode == null) {
                var i;

                for (i = 0; i < this.tab.childNodes.length; i++) {
                    var child = this.tab.childNodes[i];

                    if (child.id == oid)
                        o = child;
                }
            }
            if (o != null && strGroupName != null) {
                if (!this.IsInGroupCache(strGroupName))
                    o = null;
            }
            if (o != null) {
                if (typeof fn == "function" && this.NoOutstandingECBRequests())
                    fn(args);
                return o;
            }
            if (fn != null && this.fnEcbCallback == null)
                this.fnEcbCallback = function() {
                    fn(args);
                };
            if (this.isEcbInfo || this.bRequestOutstanding) {
                if (!this.isEcbInfo || strGroupName != null && strGroupName != this.strGroupName)
                    this.EnqueueEcbInfoRequest(strGroupName);
                return null;
            }
            this.RefreshEcbInfo(strGroupName);
            return null;
        }
        function CLVPInvalidateEcbInfo() {
            var oid = "ecbtab_ctx" + this.ctx.ctxId;
            var o = document.getElementById(oid);

            if (o != null && o.parentNode != null) {
                o.parentNode.removeChild(o);
                this.DeleteGroupNameCache();
            }
        }
        function CLVPGetEcbInfo(iid) {
            var tab = this.EnsureEcbInfo();

            if (tab != null) {
                if (typeof tab.dict != "undefined" && tab.dict != null)
                    return tab.dict[iid];
            }
            return null;
        }
        function CLVPEnsureChangeContext() {
            if (this.cctx == null) {
                this.cctx = new SP.ClientContext(null);
            }
        }
        function CLVPDeleteItemCore(itemId) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "item deletion not yet implemented in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function CLVPCheckoutItem(itemId, fsobjtype) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "checkin/checkout not yet supported in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function CLVPDiscardCheckoutItem(itemId, fsobjtype) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "checkin/checkout not yet supported in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function CLVPCheckinItem(itemId, fsobjtype, args) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "checkin/checkout not yet supported in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function CLVPManageCopies(itemId, fsobjtype) {
            if (fsobjtype != "0")
                return;
            var ecb = this.GetEcbInfo(itemId);

            if (ecb != null && ecb.getAttribute("Url") != null) {
                var url = this.ctx.HttpRoot + "/_layouts/15/managecopies.aspx?ItemUrl=" + URI_Encoding.encodeURIComponent(ecb.getAttribute("Url")) + "&Source=" + Nav.getSource();
                var ctxT = window["ctx" + this.ctx.ctxId];

                if (ctxT != null && ctxT.clvp != null) {
                    var clvp = ctxT.clvp;
                    var urlT = FixUrlFromClvp(clvp, url);

                    clvp.ShowPopup(urlT);
                    return;
                }
                Nav.navigate(url);
            }
        }
        function CLVPShowErrorDialog(callback) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "error dialog not yet supported in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function CLVPRefreshInplViewUrl() {
            this.inplUrl = null;
            this.inplUrl = this.InplViewUrl();
            return false;
        }
        function CLVPInplViewUrl() {
            if (this.inplUrl != null) {
                if (typeof this.ctx.IsClientRendering != "undefined" && this.ctx.IsClientRendering && this.isEcbInfo) {
                    return this.inplUrl + "&IsRibbon=TRUE";
                }
                return this.inplUrl;
            }
            var rg = [];
            var str = URI_Encoding.escapeUrlForCallback(this.ctx.HttpRoot);

            rg.push(str);
            if (str[str.length - 1] != "/")
                rg.push("/");
            rg.push("_layouts/15/inplview.aspx?List=");
            rg.push(this.ctx.listName);
            if (this.ctx.view != null) {
                rg.push("&View=");
                rg.push(this.ctx.view);
            }
            rg.push("&ViewCount=");
            rg.push(this.ctx.ctxId);
            if (typeof this.ctx.isXslView != "undefined" && this.ctx.isXslView) {
                rg.push("&IsXslView=TRUE");
            }
            if (typeof this.ctx.IsClientRendering != "undefined" && this.ctx.IsClientRendering) {
                rg.push("&IsCSR=TRUE");
            }
            if (typeof this.ctx.overrideSelectCommand != "undefined") {
                rg.push("&HasOverrideSelectCommand=TRUE");
            }
            var arrayField = null;

            if (typeof this.ctx.overrideFilterQstring != "undefined") {
                arrayField = this.ctx.overrideFilterQstring.match(RegExp("OverrideScope=[^&]*"));
            }
            if (typeof this.ctx.overrideScope != "undefined" && arrayField == null) {
                rg.push("&OverrideScope=" + this.ctx.overrideScope);
            }
            if (typeof this.ctx.overrideFilterQstring != "undefined") {
                rg.push("&");
                rg.push(this.ctx.overrideFilterQstring);
            }
            if (typeof this.ctx.IsClientRendering != "undefined" && !this.ctx.IsClientRendering) {
                rg.push("&ListViewPageUrl=");
                var uri = new URI(window.location.href, {
                    disableEncodingDecodingForLegacyCode: true
                });

                rg.push(URI_Encoding.encodeURIComponent(uri.getStringWithoutQueryAndFragment(), false));
            }
            if (typeof this.ctx.searchTerm != "undefined" && this.ctx.searchTerm != null) {
                rg.push("&InplaceSearchQuery=");
                rg.push(URI_Encoding.encodeURIComponent(this.ctx.searchTerm, true));
            }
            if (typeof this.ctx.fullListSearch != "undefined" && this.ctx.fullListSearch != null && this.ctx.fullListSearch == true) {
                rg.push("&InplaceFullListSearch=true");
            }
            this.inplUrl = rg.join("");
            delete rg;
            if (typeof this.ctx.IsClientRendering != "undefined" && this.ctx.IsClientRendering && this.isEcbInfo) {
                return this.inplUrl + "&IsRibbon=TRUE";
            }
            else {
                return this.inplUrl;
            }
        }
        function CLVPInplViewUrlTrim(strInputInplViewUrl) {
            var returnValue = "";

            if (Boolean(strInputInplViewUrl)) {
                if (typeof this.ctx.overrideFilterQstring != "undefined") {
                    returnValue = strInputInplViewUrl.substr((this.InplViewUrl()).length - this.ctx.overrideFilterQstring.length);
                }
                else {
                    returnValue = strInputInplViewUrl.substr((this.InplViewUrl()).length + 1);
                }
            }
            return returnValue;
        }
        function CLVPInplViewUrlHash(strUrl) {
            var strHash = this.InplViewUrlTrim(strUrl);

            strHash = EncodeQueryStringAsHash(strHash);
            (function() {
                if (!(strHash.indexOf('?') == -1)) {
                    if (confirm("Assertion failed: " + "strHash should not contain a query string" + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            return strHash;
        }
        function CLVPShowPopup(url) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "popups not supported yet in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            return false;
        }
        function CLVPIsInGroupCache(strGroupName) {
            if (this.strGroupCache == null)
                return false;
            return this.strGroupCache.indexOf(strGroupName + "$") != -1;
        }
        function CLVPCacheGroupName(strGroupName) {
            if (this.strGroupCache == null) {
                this.strGroupCache = strGroupName + "$";
            }
            else {
                this.strGroupCache = this.strGroupCache + strGroupName + "$";
            }
        }
        function CLVPDeleteGroupNameCache() {
            if (this.strGroupCache == null)
                return;
            var ichStart = 0;
            var ichNext;

            ichNext = this.strGroupCache.indexOf("$", ichStart);
            while (ichNext != -1) {
                var strGroupName = this.strGroupCache.substring(ichStart, ichNext);
                var oid = "ecbtab_ctx" + this.ctx.ctxId + "_" + strGroupName;
                var o = document.getElementById(oid);

                if (Boolean(o)) {
                    this.tab.removeChild(o);
                }
                ichStart = ichNext + 1;
                ichNext = this.strGroupCache.indexOf("$", ichStart);
            }
            this.strGroupCache = null;
        }
        function CLVPEnqueueEcbInfoRequest(strGroupName) {
            var i;

            for (i = 0; i < this.queueEcbInfo.length; i++) {
                if (this.queueEcbInfo[i] == strGroupName)
                    return;
            }
            this.queueEcbInfo.push(strGroupName);
        }
        function CLVPNoOutstandingECBRequests() {
            if (this.isEcbInfo)
                return false;
            if (this.queueEcbInfo.length > 0)
                return false;
            return true;
        }
        function SetFocusBack(dialogResult) {
            if (dialogResult == 0 || focusAcc != null && focusAcc.focusInCLVPTab != null && focusAcc.focusInCLVPTab != true) {
                var focusBack = null;

                if (focusAcc != null && focusAcc.elem != null)
                    focusBack = focusAcc.elem;
                if (focusBack != null && focusBack.tagName != "A") {
                    var anchorList = focusBack.getElementsByTagName("A");
                    var anchorListLen = anchorList.length;

                    if (anchorListLen > 0)
                        focusBack = anchorList[anchorListLen - 1];
                }
                if (focusBack != null && typeof focusBack.setActive != "undefined") {
                    try {
                        if (focusBack.setActive != null)
                            focusBack.setActive();
                        else if (focusBack.focus != null)
                            focusBack.focus();
                    }
                    catch (e) { }
                }
                else if (typeof SP.Ribbon != "undefined" && Boolean(SP.Ribbon) && typeof SP.Ribbon.PageManager != "undefined" && Boolean(SP.Ribbon.PageManager) && typeof SP.Ribbon.PageManager.get_instance == "function" && focusAcc != null && focusAcc.fromRibbon) {
                    var pageManager = SP.Ribbon.PageManager.get_instance();

                    if (pageManager.get_ribbon() != null) {
                        pageManager.restoreFocusToRibbon();
                    }
                }
                focusAcc = null;
            }
        }
        function ExpColGroupScripts(strHtml) {
            var rgRet = [];
            var re = /<script type="text\/javascript">ExpCollGroup\('[^']*',\s*'[^']*'\);<\/script>/g;
            var rg = re.exec(strHtml);

            while (rg != null) {
                var str = rg[0];
                var ich = str.indexOf("ExpCollGroup");
                var ichEnd = str.indexOf(";");

                rgRet.push(str.substring(ich, ichEnd + 1));
                rg = re.exec(strHtml);
            }
            return rgRet;
        }
        function InitCLVPs() {
            if (typeof g_ViewIdToViewCounterMap != "undefined") {
                var vid;

                for (vid in g_ViewIdToViewCounterMap) {
                    var ctxT = window["ctx" + g_ViewIdToViewCounterMap[vid]];

                    if (Boolean(ctxT)) {
                        var clvp = new CLVP(ctxT);

                        clvp.Init();
                    }
                }
            }
        }
        function CLVPFromCtx(ctxParam) {
            if (typeof ctxParam.clvp != "undefined")
                return ctxParam.clvp;
            return null;
        }
        function CLVPFromEventReal(evt) {
            return FindClvp();
        }
        function SetUrlKeyValue(keyName, keyValue, bEncode, url) {
            if (url == null)
                url = window.location.href + "";
            var val = keyValue;
            var uri = new URI(url, {
                disableEncodingDecodingForLegacyCode: true
            });

            url = uri.getQuery();
            if (bEncode)
                val = URI_Encoding.encodeURIComponent(val);
            if (url.indexOf(keyName + "=") < 0) {
                if (url.length > 1)
                    url += "&";
                else if (url.length == 0)
                    url += "?";
                url += keyName + "=" + val;
            }
            else {
                var re = new RegExp(keyName + "=[^&]*");

                url = url.replace(re, keyName + "=" + val);
            }
            uri.setQuery(url);
            return uri.getString();
        }
        function FixUrlFromClvp(clvp, url) {
            return FixUrlFromClvp2(clvp, url, true);
        }
        function FixUrlFromClvp2(clvp, url, fSetSource) {
            var rootFolder = clvp.rootFolder;

            if ((rootFolder == null || rootFolder.length == 0) && clvp.rgpaging == null)
                return url;
            if (rootFolder != null && rootFolder.length > 0)
                if ((url.toUpperCase()).indexOf("LISTEDIT.ASPX") == -1)
                    url = SetUrlKeyValue("RootFolder", rootFolder, true, url);
            if (fSetSource) {
                var src = GetSource2(null, clvp);

                url = SetUrlKeyValue("Source", src, true, url);
            }
            return url;
        }
        function STSNavigateToViewReal(evt, url) {
            Nav.navigate(url);
            return true;
        }
        function STSNavigate2Real(evt, url) {
            Nav.navigate(url);
            return true;
        }
        function GetSource2(defaultSource, clvp, bFetchQueryString) {
            var source = Nav.getUrlKeyValue("Source");

            if (source == "") {
                if (defaultSource != null && defaultSource != "")
                    source = defaultSource;
                else {
                    source = window.location.href;
                }
            }
            if (clvp != null && (clvp.rootFolder != null || clvp.rgpaging != null)) {
                if (source != "") {
                    if (clvp.rootFolder != null && clvp.rootFolder != "")
                        source = SetUrlKeyValue("RootFolder", clvp.rootFolder, true, source);
                    if (clvp.rgpaging != null && (!(clvp.ctx != null && clvp.ctx.IsClientRendering) || bFetchQueryString)) {
                        var key;

                        for (key in clvp.rgpaging) {
                            source = SetUrlKeyValue(key, clvp.rgpaging[key], false, source);
                        }
                        if (clvp.rgpaging["PagedPrev"] == null) {
                            source = URI.removeKeyValue("PagedPrev", source);
                            source = URI.removeKeyValue("PageLastRow", source);
                        }
                        if (clvp.rgpaging["PageFirstRow"] == null) {
                            source = URI.removeKeyValue("PageFirstRow", source);
                        }
                    }
                }
            }
            return Nav.pageUrlValidation(source);
        }
        function FindClvp(obj) {
            if (!Boolean(standaloneCtx.clvp)) {
                standaloneCtx.clvp = new CLVP(standaloneCtx);
                standaloneCtx.clvp.Init();
            }
            return standaloneCtx.clvp;
        }
        function getFilterQueryParam(strDocUrl) {
            if (strDocUrl == null || strDocUrl == "")
                return "";
            var strFilterQuery = "";
            var i = 0;
            var arrayField;

            do {
                i++;
                arrayField = strDocUrl.match(RegExp("FilterField" + String(i) + "=[^&]*" + "&FilterValue" + String(i) + "=[^&]*"));
                if (arrayField != null)
                    strFilterQuery = strFilterQuery + "&" + arrayField[0];
            } while (arrayField != null);
            i = 0;
            do {
                i++;
                arrayField = strDocUrl.match(RegExp("FilterFields" + String(i) + "=[^&]*" + "&FilterValues" + String(i) + "=[^&]*"));
                if (arrayField != null)
                    strFilterQuery = strFilterQuery + "&" + arrayField[0];
            } while (arrayField != null);
            i = 0;
            do {
                i++;
                arrayField = strDocUrl.match(RegExp("FilterOp" + String(i) + "=[^&]*" + "&FilterLookupId" + String(i) + "=[^&]*" + "&FilterData" + String(i) + "=[^&]*"));
                if (arrayField != null)
                    strFilterQuery = strFilterQuery + "&" + arrayField[0];
            } while (arrayField != null);
            return strFilterQuery;
        }
        function OnClickFilterV4(obj) {
            var o = ListModule.Util.findSTSMenuTable(obj, "CTXNum");
            var clvp = FindClvp(obj);

            if (o != null && o.getAttribute("SortFields") != null) {
                if (clvp != null)
                    clvp.ctx.operationType = SPListOperationType.Sort;
                var strSortFields = o.getAttribute("SortFields");

                if (strSortFields.indexOf("?") > 0) {
                    strSortFields = strSortFields.substr(strSortFields.indexOf("?") + 1);
                }
                var url = ListModule.Util.getUrlWithNoSortParameters(strSortFields);

                url = ListModule.Util.removePagingArgs(url);
                if (url.indexOf("?") < 0)
                    url += "?";
                else
                    url += "&";
                url = url + strSortFields;
                if (clvp != null)
                    url += getFilterQueryParam(clvp.ctx.queryString);
                if (clvp != null && clvp.ctx.IsClientRendering) {
                    if (clvp.rootFolder != null)
                        url = SetUrlKeyValue("RootFolder", clvp.rootFolder, true, url);
                    clvp.ctx.queryString = url;
                    clvp.RefreshPaging(url);
                    if (strSortFields.substring(strSortFields.length - 3) == "Asc") {
                        o.setAttribute("SortFields", strSortFields.substring(0, strSortFields.length - 3) + "Desc");
                    }
                    else
                        o.setAttribute("SortFields", strSortFields.substring(0, strSortFields.length - 4) + "Asc");
                }
                else {
                    (function() {
                        if (!false) {
                            if (confirm("Assertion failed: " + "Standalone view doesn't support non-CSR views" + ". Break into debugger?"))
                                eval("debugger");
                        }
                    })();
                    ;
                }
            }
            return false;
        }
        function HandleFilterReal(evt, url, operationType) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "standalone list view does not yet support filtering" + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            return true;
        }
        function RefreshInplViewUrlByContext(ctxParam) {
            var clvp = CLVPFromCtx(ctxParam);

            return RefreshInplViewUrlInternal(clvp);
        }
        function RefreshInplViewUrl(evt) {
            var clvp = CLVPFromEventReal(evt);

            return RefreshInplViewUrlInternal(clvp);
        }
        function RefreshInplViewUrlInternal(clvp) {
            if (clvp == null)
                return false;
            return clvp.RefreshInplViewUrl();
        }
        function CancelRefreshViewByContext(ctxParam) {
            var clvp = CLVPFromCtx(ctxParam);

            return CancelRefreshViewInternal(clvp);
        }
        function CancelRefreshView(evt) {
            var clvp = CLVPFromEventReal(evt);

            return CancelRefreshViewInternal(clvp);
        }
        function CancelRefreshViewInternal(clvp) {
            if (clvp == null)
                return false;
            return clvp.CancelAnyOutstandingRequest();
        }
        function HandleRefreshViewByContext(ctxParam) {
            var clvp = CLVPFromCtx(ctxParam);

            if (clvp == null)
                return false;
            HandleRefreshViewInternal(clvp);
            return false;
        }
        function HandleRefreshView(evt) {
            var clvp = CLVPFromEventReal(evt);

            if (clvp == null)
                return false;
            HandleRefreshViewInternal(clvp);
            return false;
        }
        function HandleRefreshViewInternal(clvp) {
            var url = clvp.ctx.queryString;
            var ctxObj = clvp.ctx;

            url = FixUrlFromClvp2(clvp, url, false);
            clvp.RefreshPaging(url);
        }
        function InitAllClvps() {
            InitCLVPs();
        }
        function FixDroppedOrPastedClvps() {
            if (typeof g_ViewIdToViewCounterMap != "undefined") {
                var vid;

                for (vid in g_ViewIdToViewCounterMap) {
                    var ctxT = window["ctx" + g_ViewIdToViewCounterMap[vid]];

                    if (Boolean(ctxT)) {
                        var clvp = ctxT.clvp;

                        if (Boolean(clvp) && (!Boolean(clvp.tab) || !Boolean(clvp.tab.parentNode) || 1 != clvp.tab.parentNode.nodeType)) {
                            clvp = new CLVP(ctxT);
                            clvp.Init();
                        }
                    }
                }
            }
        }
        function FocusInfo_InitializePrototype() {
            FocusInfo.prototype = {
                elem: null,
                id: null,
                tagName: null,
                focusInCLVPTab: null,
                fromRibbon: undefined,
                setActive: undefined
            };
        }
        FocusInfo_InitializePrototype();
        function FocusInfo() {
        }
        var focusAcc = null;

        function GetFocusInfo(evt, clvp) {
            var focusInfo = new FocusInfo();

            focusInfo.fromRibbon = typeof evt.fromRibbon != "undefined" ? evt.fromRibbon : undefined;
            var focusBack = null;

            if (Boolean(evt.target)) {
                focusBack = evt.target;
            }
            else if (Boolean(evt.srcElement)) {
                focusBack = evt.srcElement;
            }
            if (typeof evt.fakeEvent != 'undefined' && evt.fakeEvent) {
                if (typeof focusBack.master != "undefined" && focusBack.master != null && typeof focusBack.master._oParent != "undefined")
                    focusBack = focusBack.master._oParent;
                if (focusBack != null && focusBack.tagName != "A") {
                    focusBack = (focusBack.getElementsByTagName("A"))[0];
                }
            }
            else {
                if (Boolean(evt.fromRibbon) != true) {
                    while (focusBack.tagName != "A" && focusBack.tagName != "BODY") {
                        focusBack = focusBack.parentNode;
                    }
                }
            }
            var focusBackId = null;

            if (focusBack != null) {
                while (focusBack.id.length == 0 && focusBack.tagName != "BODY") {
                    focusBack = focusBack.parentNode;
                }
                focusBackId = focusBack.id;
            }
            var focusBackTag = null;

            if (focusBack != null)
                focusBackTag = focusBack.tagName;
            var bFocusInCLVPTab = false;
            var focusTabl = null;

            if (clvp != null)
                focusTabl = clvp.tab;
            if (focusTabl != null && focusBackTag != null && focusBackId != null) {
                var focusArray = focusTabl.getElementsByTagName(focusBackTag);

                for (var i = 0; i < focusArray.length; i++) {
                    if (focusArray[i].id == focusBackId) {
                        bFocusInCLVPTab = true;
                        break;
                    }
                }
            }
            focusInfo.elem = focusBack;
            focusInfo.id = focusBackId;
            focusInfo.tagName = focusBackTag;
            focusInfo.focusInCLVPTab = bFocusInCLVPTab;
            focusAcc = focusInfo;
        }
        function ExpGroup(evt, groupName) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "grouping not yet supported in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function DeleteSelectedItemsCore(ctxParam, items, onSuccess, onFailure) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "item deletion not yet supported in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function DeleteSelectedItems(ctxParam) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "item deletion not yet supported in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function ContainsRecurrenceItem(items) {
            for (var key in items) {
                var item = items[key];

                if (Boolean(item) && typeof item.id != "undefined" && Boolean(item.id)) {
                    var idLocal = item.id;

                    if (idLocal.indexOf(".0.") != -1 || idLocal.indexOf(".1.") != -1 || idLocal.indexOf(".2.") != -1)
                        return true;
                }
            }
            return false;
        }
        function CheckOutSingleItem(ctxParam, tab) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "checkin/checkout not yet supported in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function FixupCtx(ctxParam) {
            if (Boolean(ctxParam) && typeof ctxParam.clvp == "undefined" && typeof ctxParam.ctxId != "undefined") {
                var ctxT = window["ctx" + ctxParam.ctxId];

                if (ctxT) {
                    return ctxT;
                }
            }
            return ctxParam;
        }
        function CheckInSingleItemFromECB(evt, ctxParam, tab) {
            ctxParam = FixupCtx(ctxParam);
            var clvp = ctxParam.clvp;

            GetFocusInfo(evt, clvp);
            CheckInSingleItem(ctxParam, tab);
        }
        function CheckInSingleItem(ctxParam, tab) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "checkin/checkout not yet supported in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function CheckInNotifyAndRefreshPage(dialogResult) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "checkin/checkout not yet supported in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function AttachFile(ctxParam) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "File attatchment not yet supported in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function ManageCopies(ctxParam) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "manage copies not yet supported in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function CheckoutSelectedItems(ctxParam) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "checkin/checkout not yet supported in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function DiscardCheckoutSelectedItems(ctxParam) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "checkin/checkout not yet supported in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function CheckinSelectedItems(ctxParam) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "checkin/checkout not yet supported in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function CLVPModerateItem(itemId, approveDialogResult) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "moderation not yet supported in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function ModerateSelectedItems(ctxParam) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "moderation not yet supported in standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
        }
        function DismissErrDlg(b) {
            var dlg = typeof window.top.g_childDialog != "undefined" ? window.top.g_childDialog : undefined;

            if (Boolean(dlg)) {
                dlg.close(0);
            }
        }
        function CanNavigateUp(ctxParam) {
            if (ctxParam == null || ctxParam.clvp == null) {
                return false;
            }
            var curRootFolder = URI.decodeURIComponent(ListModule.Util.getRootFolder2(ctxParam));

            if (curRootFolder == null || curRootFolder == URI.decodeURIComponent(ctxParam.listUrlDir)) {
                return false;
            }
            return true;
        }
        function NavigateUp(ctxParam) {
            if (!CanNavigateUp(ctxParam)) {
                return;
            }
            var curRootFolder = URI.decodeURIComponent(ListModule.Util.getRootFolder2(ctxParam));

            if (curRootFolder == null)
                return;
            var ich = curRootFolder.lastIndexOf("/");
            var parentFolder = "";

            if (ich > 0) {
                parentFolder = curRootFolder.substr(0, ich);
            }
            else {
                return;
            }
            var url = Nav.ajaxNavigate.get_href();
            var view = ctxParam.view;

            url = URI.removeParameters(url);
            url = SetUrlKeyValue("RootFolder", parentFolder, true, url);
            url = SetUrlKeyValue("View", view, false, url);
            Nav.navigate(url);
        }
        function EnumCLVPs(callback) {
            var fRet = false;

            if (typeof g_ViewIdToViewCounterMap != "undefined") {
                var vid;

                for (vid in g_ViewIdToViewCounterMap) {
                    var ctxT;

                    eval("ctxT = ctx" + g_ViewIdToViewCounterMap[vid] + ";");
                    var clvp = ctxT.clvp;

                    if (clvp != null) {
                        callback(clvp);
                        fRet = true;
                    }
                }
            }
            return fRet;
        }
        function RestoreClvpNavigation(clvp) {
            clvp.RestoreNavigation();
        }
        function RestoreAllClvpsNavigation() {
            EnumCLVPs(RestoreClvpNavigation);
        }
        InitAllClvps();
        var inplview = {
            CheckOutSingleItem: CheckOutSingleItem,
            InitAllClvps: InitAllClvps,
            HandleFilterReal: HandleFilterReal,
            OnClickFilterV4: OnClickFilterV4,
            RefreshInplViewUrl: RefreshInplViewUrl,
            RefreshInplViewUrlByContext: RefreshInplViewUrlByContext,
            CancelRefreshView: CancelRefreshView,
            CancelRefreshViewByContext: CancelRefreshViewByContext,
            HandleRefreshView: HandleRefreshView,
            HandleRefreshViewByContext: HandleRefreshViewByContext,
            STSNavigate2Real: STSNavigate2Real,
            DeleteSelectedItems: DeleteSelectedItems,
            ExpGroup: ExpGroup,
            STSNavigateToViewReal: STSNavigateToViewReal,
            CheckInSingleItemFromECB: CheckInSingleItemFromECB,
            RestoreAllClvpsNavigation: RestoreAllClvpsNavigation,
            RefreshPageTo: RefreshPageToEx
        };

        function CompareUrls(str1, str2) {
            if (typeof str1 == 'undefined' || str1 == null || typeof str2 == 'undefined' || str2 == null)
                return false;
            else
                return str1 == str2;
        }
        function MergeListData(existingData, dataToMerge) {
            (function() {
                if (!false) {
                    if (confirm("Assertion failed: " + "This code depends on mQuery which is not available in the standalone view." + ". Break into debugger?"))
                        eval("debugger");
                }
            })();
            ;
            return existingData;
        }
        function CanSupportRoamingApps() {
            return false;
        }
        var standaloneCtx = null;

        module.RenderListView = RenderListView;
    })(window);
}
$_global_listview();
