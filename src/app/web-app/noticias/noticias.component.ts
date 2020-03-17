import { Component, OnInit, Renderer, ViewChild, ElementRef } from '@angular/core';
import { NoticiasService } from "../../shared/services/noticias.service"
import { Noticia } from "../../shared/models/noticia.model"
import { Subscription } from "rxjs"
import { Router } from "@angular/router"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"

@Component({
  selector: 'app-noticias',
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.css']
})
export class NoticiasComponent implements OnInit {

  @ViewChild('closeModal') private closeModal: ElementRef

  private httpReq: Subscription

  //Dataset
  noticias: Noticia[]

  //Forms Set
  keywordFilterForm: FormGroup

  //Control Variables
  isLoading: boolean = false
  messageApi: string
  statusResponse: number
  p: number
  total: number
  limit: number
  filterKeyword: boolean = false
  order: boolean = false

  //Selected Items
  dropdownOrderSelectedItem: any

  //Menu Items Set
  dropdownOrderMenuItems: any[] = [
    { option: 'Data - mais novo primeiro', param: 'descending' },
    { option: 'Data - mais antigo primeiro', param: 'ascending' }
  ]

  constructor(
    private _service: NoticiasService,
    private r: Router,
    private render: Renderer,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.r.routeReuseStrategy.shouldReuseRoute = () => false

    this._service.params = this._service.params.set('order', 'descending')
    this._service.params = this._service.params.set('page', '1')
    this._service.params = this._service.params.set('limit', '6')

    this.getNoticiasWithParams()

    //Init Form
    this.keywordFilterForm = this.fb.group({
      keyword: this.fb.control(null, [Validators.required]),
    })
  }

  ngOnDestroy() {
    this.httpReq.unsubscribe()
  }

  getNoticiasWithParams() {
    this.isLoading = true
    this.httpReq = this._service.getNoticiasWithParams().subscribe(response => {
      this.statusResponse = response.status
      this.messageApi = response.body['message']
      this.noticias = response.body['data']
      this.p = response.body['page']
      this.total = response.body['count']
      this.limit = response.body['limit']
      this.isLoading = false
    }, err => {
      this.statusResponse = err.status
      this.messageApi = err.error['message']
      this.isLoading = false
    })
  }

  getPage(page: number) {
    this.noticias = null
    this._service.params = this._service.params.set('page', page.toString())
    this.getNoticiasWithParams()
  }

  setActiveMenuItem(event: any) {
    let oldClasses = event.target.getAttribute('class')
    this.render.setElementAttribute(event.target, "class", `${oldClasses} active`)
  }

  onClickCleanInputFieldsDateSearch() {
    this.keywordFilterForm.reset()
  }

  onSelectOrderDropdownMenu(item: any) {
    this.order = true
    console.log(item['param'])
    this.noticias = null
    this.dropdownOrderSelectedItem = item
    this._service.params = this._service.params.set('valueSort', item['param'])
    this._service.params = this._service.params.set('columnSort','date')
    this.getNoticiasWithParams()
  }

  onClickFilterKeyword() {

    let keyword = this.keywordFilterForm.value.keyword

    this.noticias = null
    this.filterKeyword = true
    this._service.params = this._service.params.set('keyword', keyword)

    this.closeModal.nativeElement.click()
    this.keywordFilterForm.reset()

    this.getNoticiasWithParams()
  }

  clearConditions() {
    this.noticias = null

    this._service.params = this._service.params.set('page', '1')

    this.order = false
    this.dropdownOrderSelectedItem = null
    this._service.params = this._service.params.set('order', 'descending')

    this.filterKeyword = false
    this._service.params = this._service.params.delete('keyword')

    this.getNoticiasWithParams()
  }

}
