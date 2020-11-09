function createAnnotation(event) {
    event.preventDefault();
    let params = {
        pageId: $('#addA_pageId').val(),
        color: $('#addA_color').val(),
        svgCode: $('#addA_svgCode').val(),
        motivation: $('#addA_motivation').val()
    }
    postEditorStubController("create_annotation", params);
}

function readAnnotation(event) {
    event.preventDefault();
    let params = {
        id: $('#readA_annoId').val(),
    }
    postEditorStubController("read_annotation", params);
}

function updateAnnotation(event) {
    event.preventDefault();
    let params = {
        annoId: $('#updateA_annoId').val(),
        color: $('#updateA_color').val(),
        svgCode: $('#updateA_svgCode').val(),
        motivation: $('#updateA_motivation').val()
    }
    postEditorStubController("update_annotation", params);
}

function deleteAnnotation(event) {
    event.preventDefault();
    let params = {
        annoId: $('#deleteA_annoId').val(),
    }
    postEditorStubController("delete_annotation", params);
}

function validateAnnotation(event) {
    event.preventDefault();
    let params = {
        annoId: $('#validateA_annoId').val(),
    }
    postEditorStubController("validate_annotation", params);
}

function createCard(event) {
    event.preventDefault();
    let purpose = $('#createC_purpose').val();
    if (purpose === "noPurpose") {
        purpose = "";
    }
    let params = {
        annoId: $('#createC_annoId').val(),
        title: $('#createC_title').val(),
        purpose: purpose,
        value: $('#createC_value').val()
    }
    postEditorStubController("create_card", params);
}

function readCard(event) {
    event.preventDefault();
    let params = {
        id: $('#readC_id').val(),
    }
    postEditorStubController("read_card", params);
}

function updateCard(event) {
    event.preventDefault();
    let purpose = $('#updateC_purpose').val();
    if (purpose === "noPurpose") {
        purpose = "";
    }
    let params = {
        id: $('#updateC_id').val(),
        title: $('#updateC_title').val(),
        purpose: purpose,
        value: $('#updateC_value').val()
    }
    postEditorStubController("update_card", params);
}

function deleteCard(event) {
    event.preventDefault();
    let params = {
        id: $('#deleteC_id').val()
    }
    postEditorStubController("delete_card", params);
}

function createTag(event) {
    event.preventDefault();
    let params = {
        annoId: $('#createT_annoId').val(),
        title: $('#createT_title').val(),
        value: $('#createT_value').val()
    }
    postEditorStubController("create_tag", params);
}

function readTag(event) {
    event.preventDefault();
    let params = {
        id: $('#readT_id').val(),
    }
    postEditorStubController("read_tag", params);
}

function updateTag(event) {
    event.preventDefault();
    let params = {
        id: $('#updateT_id').val(),
        title: $('#updateT_title').val(),
        value: $('#updateT_value').val()
    }
    postEditorStubController("update_tag", params);
}

function deleteTag(event) {
    event.preventDefault();
    let params = {
        id: $('#deleteT_id').val()
    }
    postEditorStubController("delete_tag", params);
}

function rawManuscriptJson(event) {
    event.preventDefault();
    let params = {
        id: $('#rawMJ_id').val()
    }
    postEditorStubController("raw_manuscript_json", params);
}

function rawManuscriptXml(event) {
    event.preventDefault();
    let params = {
        id: $('#rawMX_id').val()
    }
    postEditorStubController("raw_manuscript_xml", params);
}

function rawPageJson(event) {
    event.preventDefault();
    let params = {
        id: $('#rawPJ_id').val()
    }
    postEditorStubController("raw_page_json", params);
}

function rawAnnotationJson(event) {
    event.preventDefault();
    let params = {
        id: $('#rawAJ_id').val()
    }
    postEditorStubController("raw_annotation_json", params);
}

function postEditorStubController(endpoint, params) {
    $ .ajax({
        type: 'POST',
        url: '/editor_stub/' + endpoint,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        dataType: 'text',
        data: JSON.stringify(params),

        success: function(responseData) {
            $('#viewerHolder').html(responseData);
        }
    });
}

function goHome() {
    location.href = "/";
}