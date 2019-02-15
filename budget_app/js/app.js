class UI {
  constructor() {
    this.budgetFeedback = document.querySelector(".budget-feedback");
    this.expenseFeedback = document.querySelector(".expense-feedback");
    this.budgetForm = document.getElementById("budget-form");
    this.budgetInput = document.getElementById("budget-input");
    this.budgetAmount = document.getElementById("budget-amount");
    this.expenseAmount = document.getElementById("expense-amount");
    this.balance = document.getElementById("balance");
    this.balanceAmount = document.getElementById("balance-amount");
    this.expenseForm = document.getElementById("expense-form");
    this.expenseInput = document.getElementById("expense-input");
    this.amountInput = document.getElementById("amount-input");
    this.expenseList = document.getElementById("expense-list");
    this.itemList = [];
    this.itemID = 0;
  }

  // 자금 설정 Form Submit 메소드
  submitBudgetForm() {
    const value = this.budgetInput.value;
    if(value === '' || value < 0) {
      this.budgetFeedback.classList.add('showItem'); // 경고 창을 눈에 보이게끔 하는 CSS 클래스 추가
      this.budgetFeedback.innerHTML = `<p>${value} 값을 자금으로 둘 수 없습니다. 자금은 양의 정수로만 입력하세요.</p>`;
      
      // 4초 뒤에 budget 경고 창을 안 보이게 합니다.
      // setTimeout 안의 콜백 함수에서 budgetFeedback 를 접근하기 위해 self 변수를 this 에 대입합니다.
      // 콜백함수 안에서 this 는 window 를 가리킵니다. 그래서 budgetFeedback 요소가 없다고 나옵니다.
      const self = this;
      setTimeout(function() {
        self.budgetFeedback.classList.remove('showItem');
      }, 4000);
    } else {
      this.budgetAmount.textContent = value;
      this.budgetInput.value = '';
      this.showBalance();
    }
  }

  // 잔액 확인 정보를 리-렌더링하기 위한 메소드
  showBalance() {
    const expense = this.totalExpense();
    const total = parseInt(this.budgetAmount.textContent) - expense;
    
    // div 태그에서 textContent 는 이 태그 안에 들어있는 문자열에 해당 되고, JavaScript 에서도 따로 값을 설정할 수 있습니다.
    this.balanceAmount.textContent = total;
    
    // 잔액에 따라서 색상을 바꿉니다.
    // 적자면 빨간색, 흑자면 초록색, 0 이면 검은색으로 바꿉니다.
    if(total < 0) {
      this.balance.classList.remove('showGreen', 'showBlack');
      this.balance.classList.add('showRed');
    } else if(total > 0) {
      this.balance.classList.remove('showRed', 'showBlack');
      this.balance.classList.add('showGreen');
    } else {
      this.balance.classList.remove('showRed', 'showGreen');
      this.balance.classList.add('showBlack');
    }
  }

  // 소비 설정 Form Submit 메소드
  submitExpenseForm() {
    const expenseValue = this.expenseInput.value;
    const amountValue = this.amountInput.value;

    if(expenseValue === '' || amountValue === '' || amountValue < 0) {
      this.expenseFeedback.classList.add('showItem');
      this.expenseFeedback.innerHTML = `<p>소비 금액은 양의 정수로만 입력하세요. 소비 이유도 확인 바랍니다.</p>`;
    
      const self = this;
      setTimeout(function() {
        self.expenseFeedback.classList.remove('showItem');
      }, 4000);
    } else {
      const amount = parseInt(amountValue);
      this.expenseInput.value = '';
      this.amountInput.value = '';

      let expense = {
        id : this.itemID,
        title : expenseValue,
        amount,
      }
      
      this.itemID += 1;
      this.itemList.push(expense);
      
      // 아이템 목록을 추가한 후에 DOM 에 소비 데이터 보이게 하고, 잔액 재조정을 합니다.
      this.addExpense(expense);
      this.showBalance();
    }
  }

  // 사용한 금액을 모두 합친 값을 반환하는 메소드
  totalExpense() {
    let total = 0;

    // JavaScript 에서 reduce 는 (o1, o2) 가 아닌 (현재 값, 다음 객체) 로 써야 됩니다.
    // (o1, o2) 는 자바 버전입니다.
    if(this.itemList.length > 0){
      total = this.itemList.reduce((sum, exp) => sum + exp.amount, 0);
    }
    this.expenseAmount.textContent = total;
    return total;
  }

  // 사용한 소비 내역을 추가하는 메소드
  // 자바스크립트 안에서 DOM 을 생성하고, 자식 Node 로 추가할 수 있습니다.
  addExpense(expense) {
    const div = document.createElement('div');
    div.classList.add('expense');

    // 사용 내역 편집과 삭제에서 인덱스를 가져오는 프로퍼티가 data-id 입니다.
    div.innerHTML = `
      <div class="expense-item d-flex justify-content-between align-items-baseline">
        <h6 class="expense-title mb-0 text-uppercase list-item">${expense.title}</h6>
        <h5 class="expense-amount mb-0 list-item">${expense.amount}</h5>
        <div class="expense-icons list-item">
          <a href="#" class="edit-icon mx-2" data-id="${expense.id}">
            <i class="fas fa-edit"></i>
          </a>
          <a href="#" class="delete-icon" data-id="${expense.id}">
            <i class="fas fa-trash"></i>
          </a>
        </div>
      </div>
    `;
    this.expenseList.appendChild(div);
  }

  // 사용 내역 수정과 삭제 통합
  editExpense(element, hasRemoved) {
    let id = parseInt(element.dataset.id); // 위의 DOM 에서 작성한 data-id 프로퍼티의 값을 가져올 때 사용.
    let parent = element.parentElement.parentElement.parentElement; // 사용 내역에 해당 되는 DOM 을 삭제하기 위해 맨 상위에 해당하는 DOM 을 참조합니다.
    
    // 1단계. DOM 을 삭제합니다.
    this.expenseList.removeChild(parent);

    // 2단계. 목록에서 삭제하고, Input Form 에 데이터를 저장합니다.
    if(!hasRemoved) {
      let expense = this.itemList.filter(item => id === item.id);
      this.expenseInput.value = expense[0].title;
      this.amountInput.value = expense[0].amount;
    }

    let tempList = this.itemList.filter(item => id !== item.id);
    this.itemList = tempList;
    this.showBalance();
  }
}

function eventListeners() {
  const budgetForm = document.getElementById('budget-form');
  const expenseForm = document.getElementById('expense-form');
  const expenseList = document.getElementById('expense-list');

  // User Interface 클래스에 대한 인스턴스
  const ui = new UI()

  // 금액에 대한 SUBMIT 작업
  budgetForm.addEventListener('submit', function(event) {
    event.preventDefault();
    ui.submitBudgetForm();
  });

  // 사용 금액에 대한 SUBMIT 작업
  expenseForm.addEventListener('submit', function(event) {
    event.preventDefault();
    ui.submitExpenseForm();
  });

  // 사용 내역의 우측 버튼들을 클릭하면 실행되는 작업
  expenseList.addEventListener('click', function(event) {
    if(event.target.parentElement.classList.contains('edit-icon')) {
      ui.editExpense(event.target.parentElement, false);
    }
    else if(event.target.parentElement.classList.contains('delete-icon')) {
      ui.editExpense(event.target.parentElement, true);
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  eventListeners();
});