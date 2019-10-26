package ast;
import java.util.*;
/**
 * @author GAO RISHENG
 * this class is in charge of syntax generation of return statement 
 * in Python programs
 *
 */
public class ASTReturnStatementP extends ASTReturnStatement {
	ArrayList<ASTExpression> exps;
	public ASTReturnStatementP() {
		super();
		this.exps = new ArrayList<ASTExpression>();
	}
	public void addExp(ASTExpression exp){
		this.exps.add(exp);
		exp.addParent(this);
	}
	public String toSyntax(){
		this.result = "return ";
		for(int i = 0;i<this.exps.size();i++){
			this.result+=this.exps.get(i).toSyntax();
			if(i!=this.exps.size()-1){
				this.result+=", ";
			}
		}
		return this.result;
	}

}
