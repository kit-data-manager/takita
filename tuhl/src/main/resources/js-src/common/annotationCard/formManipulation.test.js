import { modifyBodyFormHorizontal } from './formManipulation';

describe('modifying a form element created by the external jsonForm library', () => {
  it('removes the wrappingfieldset and changes an input element', () => {
    const $container = document.createElement('div');
    $container.innerHTML = `<form id="formHorizontal37f50675-02e0-4626-afbc-2e643916b3a5" class="col horizontalFormForm"><div><fieldset class="form-group jsonform-error-  ">
            <div class="form-group jsonform-error-value horizontalFormDiv">
                <label for="jsonform-14-elt-value">Classification: </label>
                <div class="controls">
                    <input type="text" class="form-control" name="value"
                        value="mrw (direct)" id="jsonform-14-elt-value"
                        aria-label="Classification: ">
                    <span class="help-block jsonform-errortext" style="display:none;"
                    ></span>
                </div>
            </div>
            <div class="form-group jsonform-error-purpose d-none">
                <label for="jsonform-14-elt-purpose">purpose</label>
                <div class="controls">
                    <input type="text" class="form-control" name="purpose"
                        value="classifying" id="jsonform-14-elt-purpose"
                        aria-label="purpose">
                    <span class="help-block jsonform-errortext" style="display:none;"
                    ></span>
                </div>
            </div>
        </fieldset>
        <input type="submit" class="btn btn-primary " value="Update + Save">
    </div>
</form>`;
    document.body.appendChild($container);
    const modBody = {
      annotationId: 'http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d',
      id: '37f50675-02e0-4626-afbc-2e643916b3a5',
      creators: ['Tester', 'dasd'],
      created: '2024-07-09T07:03:38.000Z',
      modified: '2024-07-09T08:12:26.000Z',
      value: 'mrw (direct)',
      purpose: 'classifying',
      fullJson:
        '{"type":"TextualBody","created":"2024-07-09T07:03:38Z","creator":[{"type":"Person","name":"Tester"},{"type":"Person","name":"dasd"}],"modified":"2024-07-09T08:12:26.885932Z","value":"mrw (direct)","purpose":"classifying"}',
    };
    const $horizontalForm = document.getElementById('formHorizontal37f50675-02e0-4626-afbc-2e643916b3a5');
    modifyBodyFormHorizontal($horizontalForm, modBody);
    //     const changedForm = `<form id="formHorizontal37f50675-02e0-4626-afbc-2e643916b3a5" class="col horizontalFormForm"><div>
    //         <div class="form-group jsonform-error-id d-none">
    //             <label for="jsonform-14-elt-id">id</label>
    //             <div class="controls">
    //                 <input type="text" class="form-control" name="id"
    //                     value="37f50675-02e0-4626-afbc-2e643916b3a5" id="jsonform-14-elt-id"
    //                     aria-label="id">
    //                 <span class="help-block jsonform-errortext" style="display:none;"></span>
    //             </div>
    //         </div>
    //         <div class="form-group jsonform-error-creators d-none">
    //             <label for="jsonform-14-elt-creators">creators</label>
    //             <div class="controls">
    //                 <div id="jsonform-14-elt-creators">
    //                     <ul class="_jsonform-array-ul" style="list-style-type:none;">
    //                         <li data-idx="0">
    //                             <div class="form-group jsonform-error-creators[0]">
    //                                 <label for="jsonform-14-elt-creators[0]">creators</label>
    //                                 <div class="controls">
    //                                     <input type="text" class="form-control"
    //                                         name="creators[0]" value="Tester"
    //                                         id="jsonform-14-elt-creators[0]"
    //                                         aria-label="creators">
    //                                     <span class="help-block jsonform-errortext"
    //                                         style="display:none;"></span>
    //                                 </div>
    //                             </div>
    //                         </li>
    //                         <li data-idx="1">
    //                             <div class="form-group jsonform-error-creators[1]">
    //                                 <label for="jsonform-14-elt-creators[1]">creators</label>
    //                                 <div class="controls">
    //                                     <input type="text" class="form-control"
    //                                         name="creators[1]" value="dasd"
    //                                         id="jsonform-14-elt-creators[1]"
    //                                         aria-label="creators">
    //                                     <span class="help-block jsonform-errortext"
    //                                         style="display:none;"></span>
    //                                 </div>
    //                             </div>
    //                         </li>
    //                     </ul>
    //                     <span class="_jsonform-array-buttons">
    //                         <a href="#" class="btn btn-default _jsonform-array-addmore">
    //                             <i class="glyphicon glyphicon-plus-sign" title="Add new"></i>
    //                         </a>
    //                         <a href="#" class="btn btn-default _jsonform-array-deletelast">
    //                             <i class="glyphicon glyphicon-minus-sign" title="Delete last"
    //                             ></i>
    //                         </a>
    //                     </span>
    //                 </div>
    //                 <span class="help-block jsonform-errortext" style="display:none;"></span>
    //             </div>
    //         </div>
    //         <div class="form-group jsonform-error-modified d-none">
    //             <label for="jsonform-14-elt-modified">modified</label>
    //             <div class="controls">
    //                 <input type="text" class="form-control" name="modified"
    //                     value="2024-07-09T08:12:26.000Z" id="jsonform-14-elt-modified"
    //                     aria-label="modified">
    //                 <span class="help-block jsonform-errortext" style="display:none;"></span>
    //             </div>
    //         </div>
    //         <div class="form-group jsonform-error-value horizontalFormDiv">
    //             <label for="jsonform-14-elt-value">Classification: </label>
    //             <div class="controls">
    //                 <input type="text" class="form-control" name="value" value="mrw (direct)"
    //                     id="jsonform-14-elt-value" aria-label="Classification: ">
    //                 <span class="help-block jsonform-errortext" style="display:none;"></span>
    //             </div>
    //         </div>
    //         <div class="form-group jsonform-error-purpose d-none">
    //             <label for="jsonform-14-elt-purpose">purpose</label>
    //             <div class="controls">
    //                 <input type="text" class="form-control" name="purpose" value="classifying"
    //                     id="jsonform-14-elt-purpose" aria-label="purpose">
    //                 <span class="help-block jsonform-errortext" style="display:none;"></span>
    //             </div>
    //         </div>
    //         <input type="submit" class="btn btn-primary horizontalFormInput" value="Save"
    //             disabled="">
    //     </div>
    // </form>
    // `;
    const changedFormInnerHtml = `<div>
            <div class="form-group jsonform-error-value horizontalFormDiv">
                <label for="jsonform-14-elt-value">Classification: </label>
                <div class="controls">
                    <input type="text" class="form-control" name="value" value="mrw (direct)" id="jsonform-14-elt-value" aria-label="Classification: ">
                    <span class="help-block jsonform-errortext" style="display:none;"></span>
                </div>
            </div>
            <div class="form-group jsonform-error-purpose d-none">
                <label for="jsonform-14-elt-purpose">purpose</label>
                <div class="controls">
                    <input type="text" class="form-control" name="purpose" value="classifying" id="jsonform-14-elt-purpose" aria-label="purpose">
                    <span class="help-block jsonform-errortext" style="display:none;"></span>
                </div>
            </div>
        
        <input type="submit" class="btn btn-primary horizontalFormInput" value="Save" disabled="">
    </div>
`;
    expect($horizontalForm.innerHTML).toEqual(changedFormInnerHtml);
  });
});
