package ast;
/**
 * @author GAO RISHENG A0101891L
 * This class is in charge of syntax generation of while statement in Java programs
 * 
 */
public class ASTWhileStatementP extends ASTWhileStatement {

	public ASTWhileStatementP(ASTExpression exp) {
		super(exp);
	}
	//code generation
	//while(conditon):\n \tstatements\n
	public String toSyntax(){
		this.result = "while (";
		this.result +=this.condition.toSyntax();
		this.result+= "):\n";
		for(int i =0;i<this.statements.size();i++){
			this.result+="\t";
			this.result+=this.statements.get(i).toSyntax();
			this.result+="\n";
		}
		this.result+="\n";
		return this.result;
	}
}
