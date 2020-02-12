import { Component, OnInit, Renderer, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Transparencia } from "./transparencia.model"
import { TransparenciaService } from "./../services/transparencia.service"
import { Router } from "@angular/router"
import { Subscription } from "rxjs"

@Component({
  selector: 'app-portal-transparencia',
  templateUrl: './portal-transparencia.component.html',
  styleUrls: ['./portal-transparencia.component.css']
})
export class PortalTransparenciaComponent implements OnInit {

  @ViewChild('closeModal') private closeModal: ElementRef

  private httpReq: Subscription

  //Dataset
  documents: Transparencia[]

  //Forms Set
  dateBetweenFilterForm: FormGroup

  //Control Variables
  filterDate: boolean = false
  filterCategory: boolean = false
  order: boolean = false
  p: number
  total: number
  limit: number
  messageApi: string
  statusResponse: number
  isLoading: boolean

  //Selected Items
  dropdownOrderSelectedItem: any
  categorySelectedItem: any

  //Menu Items Set
  dropdownOrderMenuItems: any[] = [
    { option: 'Data - mais novo primeiro', param: 'descending' },
    { option: 'Data - mais antigo primeiro', param: 'ascending' }
  ]

  categoryMenuItems: any[] = [
    { option: 'Relatório de Atividades', param: 'relatório de atividades' },
    { option: 'Prestação de Contas', param: 'prestação de contas' },
    { option: 'Documentos Oficiais', param: 'documentos oficiais' },
  ]

  constructor(
    private _service: TransparenciaService,
    private r: Router,
    private render: Renderer,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.r.routeReuseStrategy.shouldReuseRoute = () => false

    this._service.params = this._service.params.set('order', 'descending')
    this._service.params = this._service.params.set('page', '1')

    this.getDocumentsWithParams()

    //Init Form
    this.dateBetweenFilterForm = this.fb.group({
      dateStart: this.fb.control(null, [Validators.required]),
      dateFinish: this.fb.control(null)
    })
  }

  ngOnDestroy() {
    this.httpReq.unsubscribe()
  }

  getDocumentsWithParams() {
    this.isLoading = true
    this.httpReq = this._service.getDocumentsWithParams().subscribe(response => {
      this.statusResponse = response.status
      this.documents = response.body['data']
      this.messageApi = response.body['message']
      this.p = response.body['page']
      this.total = response.body['count']
      this.limit = response.body['limit']
      this.isLoading = false
    }, err => {
      this.messageApi = err.error['message']
      this.isLoading = false
    })
  }

  setActiveMenuItem(event: any) {
    let oldClasses = event.target.getAttribute('class')

    this.render.setElementAttribute(event.target, "class", `${oldClasses} active`)
  }

  getPage(page: number) {
    this.documents = null
    this._service.params = this._service.params.set('page', page.toString())
    this.getDocumentsWithParams()
  }

  onClickCleanInputFieldsDateSearch() {
    this.dateBetweenFilterForm.reset()
  }

  onSelectOrderDropdownMenu(item: any) {
    this.dropdownOrderSelectedItem = item
    this.documents = null
    this.order = true
    this._service.params = this._service.params.set('order', item['param'])
    this.getDocumentsWithParams()
  }

  onSelectCategoryMenu(item: any) {
    this.categorySelectedItem = item
    this.documents = null
    this.filterCategory = true
    this._service.params = this._service.params.set('category', item['param'])
    this.getDocumentsWithParams()
  }

  onClickFilterDate() {

    let dateStart = this.dateBetweenFilterForm.value.dateStart
    let dateFinish = this.dateBetweenFilterForm.value.dateFinish

    this.documents = null
    this.filterDate = true
    this._service.params = this._service.params.set('dateStart', dateStart)

    if (dateFinish) {
      this._service.params = this._service.params.set('dateFinish', dateFinish)
    }

    this.closeModal.nativeElement.click()
    this.dateBetweenFilterForm.reset()

    this.getDocumentsWithParams()
  }

  clearConditions() {
    this.documents = null

    this._service.params = this._service.params.set('page', '1')

    this.filterCategory = false
    this.categorySelectedItem = null
    this._service.params = this._service.params.delete('category')

    this.filterDate = false
    this._service.params = this._service.params.delete('dateStart')
    this._service.params = this._service.params.delete('dateFinish')

    this.order = false
    this.dropdownOrderSelectedItem = null
    this._service.params = this._service.params.set('order', 'descending')

    this.getDocumentsWithParams()
  }

}