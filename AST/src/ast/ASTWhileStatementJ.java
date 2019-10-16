package ast;
/**
 * @author GAO RISHENG A0101891L
 * This class is in charge of syntax generation of while statement in Java programs
 * 
 */
public class ASTWhileStatementJ extends ASTWhileStatement {

	public ASTWhileStatementJ(ASTExpression exp) {
		super(exp);
	}
	//code generation
	//while(condition){statements}
	public String toSyntax(){
		this.result = "while (";
		this.result +=this.condition.toSyntax();
		this.result+= "){\n";
		for(int i =0;i<this.statements.size();i++){
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
