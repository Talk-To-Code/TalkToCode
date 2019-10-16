package ast;
import java.util.ArrayList;
/**
 * @author GAO RISHENG A0101891L
 * this class is mainly in charge of generation of syntax that represents a for loop in 
 * C programs
 *
 */
public class ASTForStatementC extends ASTForStatement {
	private ASTExpression initialCondition;
	private ASTExpression finalCondition;
	private ASTExpression incrementCondition;
	public ASTForStatementC() {
		super();
		this.initialCondition = new ASTExpressionUnitLiteral("1");
		this.finalCondition = new ASTExpressionUnitLiteral("1");
		this.incrementCondition = new ASTExpressionUnitLiteral("1");
		this.statements = new ArrayList<ASTStatement>();
	}
	public void addInitial(ASTExpression exp){
		this.initialCondition = exp;
		exp.addParent(this);
	}
	public void addFinal(ASTExpression exp){
		this.finalCondition = exp;
		exp.addParent(this);
	}
	public void addIncrement(ASTExpression exp){
		this.incrementCondition = exp;
		exp.addParent(this);
	}
	public void addStatement(ASTStatement s){
		this.statements.add(s);
		s.addParent(this);
	}
	//actual code generation
	public String toSyntax(){
		this.result = "for (";
		if(this.initialCondition!=null){
			this.result += this.initialCondition.toSyntax();
		}
		this.result+=";";
		if(this.finalCondition!=null){
			this.result += this.finalCondition.toSyntax();
		}
		this.result+=";";
		if(this.incrementCondition!=null){
			this.result += this.incrementCondition.toSyntax();
		}
		this.result+="){\n";
		for(int i = 0;i<this.statements.size();i++){
			for(int j = 0; j < this.indent; j++) this.result+="\t";
			this.result+="\t";
			this.result+=this.statements.get(i).toSyntax();
			this.result+="\n";
		}
		for(int i = 0; i < this.indent; i++) this.result+="\t";
		this.result+="}\n";
		return this.result;
	}
}
